import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { extractTextFromFile } from "../../../lib/extractText";
import { MAJOR_REQUIREMENTS } from "../../../lib/majorRequirements";
import { CLASS_YEARS, UNDECLARED } from "../../../lib/majors";
import {
  MIN_RESUME_WORDS,
  RESPONSE_SCHEMA,
  SYSTEM_INSTRUCTION,
  buildUserMessage,
  countWords,
  finalizeResult,
  redactContactInfo,
  type AIResult,
  type ResumeCheckResult,
} from "../../../lib/resumePrompt";

// Runs one resume check. Steps, in order:
// 1. Check the form inputs and the file (code only, no AI)
// 2. Pull the text out of the PDF or DOCX
// 3. Stop early if it's too short to be a resume (saves an AI call)
// 4. Remove the name, email, phone, and links before anything is sent
// 5. Ask Gemini, trying the next model if one is busy or rate-limited
// 6. Clean up the answer with finalizeResult and send it to the page
//
// Every error response has a `code` so the loading page can show the
// right message: badRequest, unreadable, tooShort, notResume,
// rateLimited, overloaded, failed.

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MAX_FILE_BYTES = 5 * 1024 * 1024; // matches "up to 5MB" on the upload card

// Cheapest models first. This task is a checklist, not essay grading, so
// Flash-Lite handles it well, and on the free tier the Lite models also
// have higher daily limits. The bigger models are only a backup.
// (The 2.5 models aren't available to new projects, so they're not here.)
const MODEL_FALLBACK_CHAIN = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.8-flash",
];

// Thinking (hidden reasoning) is billed and adds wait time. The schema
// and code-made checklist do the structured work, so it's set to the
// lowest level (3.x models can't turn it off fully).
function getThinkingConfig(): Record<string, unknown> {
  return { thinkingConfig: { thinkingLevel: "minimal" } };
}

// Time limits, so a slow or busy model can't keep a student waiting.
// - Each model gets 30 seconds before we move on to the next one.
// - The whole check gives up after 75 seconds and shows "busy, try again".
const PER_MODEL_TIMEOUT_MS = 30 * 1000;
const TOTAL_TIME_LIMIT_MS = 75 * 1000;

// Skips a model for a while after it fails, so later checks don't wait
// on the same failure:
// - busy, rate-limited, or too slow: skip for 1 minute
// - not available to this API key (404/403): skip for 1 hour
const skipModelUntil = new Map<string, number>();
const BUSY_COOLDOWN_MS = 60 * 1000;
const UNAVAILABLE_COOLDOWN_MS = 60 * 60 * 1000;

// Dev-only cache so re-testing the same resume doesn't use up quota.
// Clears when the dev server restarts. Never used in production.
const devCache = new Map<string, ResumeCheckResult>();

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ code, error: message }, { status });
}

// A light check that the AI's answer has the shape we asked for, before
// finalizeResult relies on it.
function looksLikeAIResult(value: unknown): value is AIResult {
  const v = value as Partial<AIResult> | null;
  return (
    !!v &&
    typeof v.isResume === "boolean" &&
    typeof v.summary === "string" &&
    Array.isArray(v.structure) &&
    Array.isArray(v.majorChecklist) &&
    !!v.skillsSection &&
    Array.isArray(v.nextSteps)
  );
}

export async function POST(req: Request) {
  // ---- 1. Inputs -------------------------------------------------------
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return errorResponse("badRequest", "Something went wrong sending your resume. Please try again.", 400);
  }

  const resumeFile = formData.get("resumeFile");
  const major = String(formData.get("major") ?? "");
  const classYear = String(formData.get("classYear") ?? "");
  const intendedMajor = String(formData.get("intendedMajor") ?? "");

  const validMajor = major === UNDECLARED || major in MAJOR_REQUIREMENTS;
  const validYear = CLASS_YEARS.some((y) => y.value === classYear);
  const validIntended = !intendedMajor || intendedMajor in MAJOR_REQUIREMENTS;

  if (!(resumeFile instanceof File) || !validMajor || !validYear || !validIntended) {
    return errorResponse("badRequest", "Please upload your resume and choose your major and class year.", 400);
  }
  if (resumeFile.size > MAX_FILE_BYTES) {
    return errorResponse("unreadable", "Your file is larger than 5MB. Please upload a smaller PDF or DOCX.", 400);
  }

  // ---- 2. Text ---------------------------------------------------------
  let resumeText: string;
  try {
    resumeText = await extractTextFromFile(resumeFile);
  } catch (err) {
    console.error("File extraction error:", err);
    return errorResponse(
      "unreadable",
      "We couldn't read that file. Please upload a PDF or DOCX. If it's a PDF, make sure it isn't a scanned image.",
      400
    );
  }

  // ---- 3. Too short (no AI call) --------------------------------------
  if (countWords(resumeText) < MIN_RESUME_WORDS) {
    return errorResponse(
      "tooShort",
      `Your resume looks too short to check (under ${MIN_RESUME_WORDS} words). If it's a scanned image, try exporting it as a text PDF or DOCX.`,
      422
    );
  }

  // ---- 4. Remove contact info, build the prompt -----------------------
  const { redacted, contact } = redactContactInfo(resumeText);
  const { message, mode, checklist } = buildUserMessage({
    major,
    classYear,
    intendedMajor: intendedMajor || undefined,
    resumeText: redacted,
    contact,
  });

  const cacheKey = message;
  if (process.env.NODE_ENV === "development" && devCache.has(cacheKey)) {
    console.log("Serving cached resume result (dev mode, no API call made)");
    return NextResponse.json(devCache.get(cacheKey));
  }

  // ---- 5. Ask Gemini, with fallback -----------------------------------
  let raw: AIResult | null = null;
  let lastStatus: unknown = null;
  let modelUsed = "";
  const startTime = Date.now();

  for (const model of MODEL_FALLBACK_CHAIN) {
    // The student left the loading page: stop trying more models.
    if (req.signal.aborted) break;
    if (Date.now() - startTime > TOTAL_TIME_LIMIT_MS) {
      console.warn("Resume check hit the total time limit");
      lastStatus = 503;
      break;
    }

    const skipUntil = skipModelUntil.get(model);
    if (skipUntil && Date.now() < skipUntil) {
      console.log(`Skipping ${model}: in cooldown`);
      continue;
    }

    try {
      const response = await ai.models.generateContent({
        model,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseJsonSchema: RESPONSE_SCHEMA,
          temperature: 0,
          seed: 42,
          maxOutputTokens: 3000,
          abortSignal: req.signal,
          // Never wait past the overall limit, even on the last model.
          httpOptions: {
            timeout: Math.max(1000, Math.min(PER_MODEL_TIMEOUT_MS, TOTAL_TIME_LIMIT_MS - (Date.now() - startTime))),
          },
          ...getThinkingConfig(),
        },
        contents: [{ role: "user", parts: [{ text: message }] }],
      });

      const usage = response.usageMetadata;
      if (usage) {
        console.log(
          `${model} tokens: prompt ${usage.promptTokenCount ?? "?"}, ` +
            `cached ${usage.cachedContentTokenCount ?? 0}, ` +
            `thinking ${usage.thoughtsTokenCount ?? 0}, ` +
            `output ${usage.candidatesTokenCount ?? "?"}`
        );
      }

      const parsed: unknown = JSON.parse(response.text ?? "");
      if (!looksLikeAIResult(parsed)) {
        console.error(`${model} returned JSON in the wrong shape`);
        continue;
      }
      raw = parsed;
      modelUsed = model;
      break;
    } catch (err) {
      if (req.signal.aborted) break;

      const e = err as { status?: unknown; error?: { status?: unknown }; message?: string; name?: string };
      const status = e?.status ?? e?.error?.status;
      const isRateLimited = status === 429 || status === "RESOURCE_EXHAUSTED";
      // 503 = busy, 504 = Google ran out of time on its end. Both mean
      // "try another model and skip this one for a minute".
      const isOverloaded =
        status === 503 || status === "UNAVAILABLE" || status === 504 || status === "DEADLINE_EXCEEDED";
      const isUnavailable = status === 404 || status === 403;
      const isTimeout = e?.name === "AbortError" || /timed? ?out/i.test(e?.message ?? "");

      if (isRateLimited || isOverloaded || isTimeout) {
        console.warn(`${model} ${isRateLimited ? "rate-limited" : isTimeout ? "too slow" : "overloaded"}, trying next model`);
        skipModelUntil.set(model, Date.now() + BUSY_COOLDOWN_MS);
        lastStatus = isRateLimited ? 429 : 503;
      } else if (isUnavailable) {
        console.warn(`${model} not available to this API key (${status}), skipping it for an hour`);
        skipModelUntil.set(model, Date.now() + UNAVAILABLE_COOLDOWN_MS);
      } else {
        console.error(`${model} failed:`, e?.message ?? err);
      }
    }
  }

  if (req.signal.aborted) {
    return errorResponse("cancelled", "Request cancelled", 499);
  }

  if (!raw) {
    if (lastStatus === 429 || lastStatus === "RESOURCE_EXHAUSTED") {
      return errorResponse(
        "rateLimited",
        "Lots of students are checking resumes right now. Please wait a minute and try again.",
        429
      );
    }
    if (lastStatus === 503 || lastStatus === "UNAVAILABLE") {
      return errorResponse("overloaded", "Our AI service is busy right now. Please try again in a moment.", 503);
    }
    return errorResponse("failed", "Something went wrong checking your resume. Please try again.", 500);
  }

  console.log(`Resume check done with ${modelUsed} in ${Date.now() - startTime}ms`);

  // ---- 6. Clean up and return -----------------------------------------
  if (!raw.isResume) {
    return errorResponse(
      "notResume",
      "This doesn't look like a resume. Please upload your resume as a PDF or DOCX.",
      422
    );
  }

  const result = finalizeResult(raw, mode, checklist);

  if (process.env.NODE_ENV === "development") {
    devCache.set(cacheKey, result);
  }

  return NextResponse.json(result);
}