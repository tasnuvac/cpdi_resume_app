"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCoverLetterContext } from "../context/CoverLetterContext";
import { recordAttempt } from "../../lib/rateLimiter";

export default function LoadingPage() {
  const router = useRouter();
  const {
    jobDescription,
    resumeFile,
    coverLetterFile,
    analysisResult,
    setAnalysisResult,
    analysisError,
    setAnalysisError,
    lastAnalyzedFingerprint,
    setLastAnalyzedFingerprint,
  } = useCoverLetterContext();

  const [progress, setProgress] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const attemptRecorded = useRef(false); // guards recordAttempt() only, not the whole effect

  useEffect(() => {
    if (!jobDescription || !resumeFile || !coverLetterFile) {
      router.push("/optimize");
      return;
    }

    const currentFingerprint = `${jobDescription}|${resumeFile.name}-${resumeFile.size}-${resumeFile.lastModified}|${coverLetterFile.name}-${coverLetterFile.size}-${coverLetterFile.lastModified}`;

    if (
      analysisResult &&
      !analysisError &&
      lastAnalyzedFingerprint === currentFingerprint
    ) {
      setProgress(100);
      const t = setTimeout(() => router.push("/feedback"), 300);
      return () => clearTimeout(t);
    }

    const controller = new AbortController();
    let cancelled = false;

    const progressInterval = setInterval(() => {
      setElapsedMs((prev) => prev + 300);
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const remaining = 90 - prev;
        const increment = Math.max(remaining * 0.08, 0.5);
        return Math.min(prev + increment, 90);
      });
    }, 300);

    async function analyze() {
      // Only record a rate-limit attempt once per real effect lifecycle —
      // this avoids double-counting on Strict Mode's dev-only double
      // invoke, without blocking the actual fetch/cleanup from running
      // correctly on every real invocation.
      if (!attemptRecorded.current) {
        attemptRecorded.current = true;
        recordAttempt();
      }

      try {
        const formData = new FormData();
        formData.append("jobDescription", jobDescription);
        formData.append("resumeFile", resumeFile as File);
        formData.append("coverLetterFile", coverLetterFile as File);

        const res = await fetch("/api/analyze-cover-letter", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        const data = await res.json();

        if (cancelled) return; // page was navigated away from — discard the result

        clearInterval(progressInterval);
        setProgress(100);

        if (!res.ok) {
          setAnalysisError(data.error || "Something went wrong. Please try again.");
          setAnalysisResult(null);
        } else {
          setAnalysisResult(data);
          setAnalysisError(null);
          setLastAnalyzedFingerprint(currentFingerprint);
        }

        setTimeout(() => {
          if (!cancelled) router.push("/feedback");
        }, 400);
      } catch (err) {
        if (controller.signal.aborted) return; // expected: cleanup aborted this, not a real failure
        clearInterval(progressInterval);
        console.error("Failed to analyze cover letter:", err);
        setAnalysisError("Something went wrong. Please try again.");
        setAnalysisResult(null);
        router.push("/feedback");
      }
    }

    analyze();

    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7C5CDB]">
          <span className="text-3xl" role="img" aria-label="Bear mascot">
            🐻
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-extrabold text-[#1A1523]">
          Reading through your cover letter...
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[#5B5468]">
          This usually takes a moment. We&apos;re checking tone, structure,
          and how well it lines up with the job description.
        </p>

        <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-[#EDE7FB]">
          <div
            className={`h-full rounded-full bg-[#7C5CDB] transition-all duration-300 ease-out ${
              progress >= 90 ? "animate-pulse" : ""
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {elapsedMs >= 20000 && (
          <p className="mt-3 text-sm text-[#9B96A8]">
            Almost there — still working behind the scenes, this can take a
            little longer for detailed feedback.
          </p>
        )}

        <div className="mt-8 rounded-xl bg-[#F3EFFC] px-4 py-3 text-sm text-[#5B5468]">
          💡 Tip: even strong drafts usually get 2–3 suggestions — that&apos;s
          completely normal.
        </div>
      </div>
    </main>
  );
}