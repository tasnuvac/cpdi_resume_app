"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ErrorModal from "../components/errorModal";
import { useResumeContext } from "../context/ResumeContext";
import { USE_MOCK_RESULTS, getMockResult } from "../../lib/mockResult";
import type { ResumeCheckResult } from "../../lib/resumePrompt";

// How long the mock check "takes", so the loading screen is visible
// when testing with mock results.
const MOCK_DELAY_MS = 1500;

type CheckInputs = {
  resumeFile: File;
  major: string;
  classYear: string;
  intendedMajor: string;
};

// An error the student should see, with a code from the API route.
class CheckError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

// Titles for each kind of error. The message comes from the API route.
const ERROR_TITLES: Record<string, string> = {
  badRequest: "Something's missing",
  unreadable: "We couldn't read your file",
  tooShort: "Your resume looks too short",
  notResume: "That doesn't look like a resume",
  rateLimited: "We're a little busy",
  overloaded: "We're a little busy",
  failed: "Something went wrong",
};

// Runs the resume check: sends the resume to /api/analyze-resume and
// returns the result. Set USE_MOCK_RESULTS in lib/mockResult.ts to true
// to test the pages without calling the AI.
async function runCheck(inputs: CheckInputs, signal: AbortSignal): Promise<ResumeCheckResult> {
  if (USE_MOCK_RESULTS) {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, MOCK_DELAY_MS);
      signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });
    return getMockResult(inputs.classYear);
  }

  const body = new FormData();
  body.append("resumeFile", inputs.resumeFile);
  body.append("major", inputs.major);
  body.append("classYear", inputs.classYear);
  body.append("intendedMajor", inputs.intendedMajor);

  let response: Response;
  try {
    response = await fetch("/api/analyze-resume", { method: "POST", body, signal });
  } catch (err) {
    if (signal.aborted) throw err;
    throw new CheckError("failed", "We couldn't reach the server. Check your internet connection and try again.");
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new CheckError(
      data?.code ?? "failed",
      data?.error ?? "Something went wrong checking your resume. Please try again."
    );
  }
  return data as ResumeCheckResult;
}

export default function LoadingPage() {
  const router = useRouter();
  const { resumeFile, major, classYear, intendedMajor, setResult } = useResumeContext();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<CheckError | null>(null);

  useEffect(() => {
    // Someone landed here directly (or refreshed): send them back to the form.
    if (!resumeFile || !major || !classYear) {
      router.replace("/optimize");
      return;
    }

    const controller = new AbortController();

    // The bar eases toward 90% and jumps to 100% when the result arrives.
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : Math.min(prev + Math.max((90 - prev) * 0.12, 0.5), 90)));
    }, 150);

    runCheck({ resumeFile, major, classYear, intendedMajor }, controller.signal)
      .then((result) => {
        clearInterval(progressInterval);
        setProgress(100);
        setResult(result);
        setTimeout(() => router.push("/feedback"), 300);
      })
      .catch((err) => {
        // Cleanup aborted the check (navigated away, or React's dev-only
        // double run). Nothing to report.
        if (controller.signal.aborted) return;
        // A warning, not an error: these are expected cases (too short,
        // busy, etc.) that the student sees in the modal below.
        console.warn("Resume check failed:", err);
        clearInterval(progressInterval);
        setError(
          err instanceof CheckError
            ? err
            : new CheckError("failed", "Something went wrong checking your resume. Please try again.")
        );
      });

    return () => {
      controller.abort();
      clearInterval(progressInterval);
    };
    // Runs once per visit; the inputs can't change while this page is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-6">
      {error && (
        <ErrorModal
          title={ERROR_TITLES[error.code] ?? ERROR_TITLES.failed}
          message={error.message}
          buttonText="Back to Resume Check"
          buttonHref="/optimize"
        />
      )}
      <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7C5CDB]">
          <span className="text-3xl" role="img" aria-label="Bear mascot">
            🐻
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-extrabold text-[#1A1523]">
          Reading through your resume...
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[#5B5468]">
          We&apos;re checking the CPDI structure and what employers expect for
          your major and class year.
        </p>
        {major && classYear && (
          <p className="mt-3 inline-flex rounded-full bg-[#EDE7FB] px-4 py-1.5 text-sm font-bold text-[#7C5CDB]">
            {classYear} · {major}
          </p>
        )}

        <div
          className="mt-8 h-2 w-full overflow-hidden rounded-full bg-[#EDE7FB]"
          role="progressbar"
          aria-label="Checking your resume"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className={`h-full rounded-full bg-[#7C5CDB] transition-all duration-300 ease-out ${
              progress >= 90 ? "animate-pulse" : ""
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-8 rounded-xl bg-[#F3EFFC] px-4 py-3 text-sm text-[#5B5468]">
          💡 Tip: every resume gets a few suggestions, even strong ones.
          That&apos;s how you keep improving.
        </div>
      </div>
    </main>
  );
}