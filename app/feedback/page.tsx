"use client";

import Link from "next/link";
import ErrorModal from "../components/errorModal";
import { useResumeContext } from "../context/ResumeContext";

// TEMPORARY (step 3): shows enough of the result to confirm the flow works
// end to end. Step 4 replaces this with the full results page.
export default function FeedbackPage() {
  const { result, major, classYear } = useResumeContext();

  // No result: the student refreshed (which clears in-memory state) or the
  // check failed. Send them back to start a new check.
  if (!result) {
    return (
      <main className="min-h-screen bg-[#FAF8F5]">
        <ErrorModal
          title="No results to show"
          message="Your results clear when the page refreshes. Upload your resume again to run a new check."
          buttonText="Go to Resume Check"
          buttonHref="/optimize"
        />
      </main>
    );
  }

  const missing = result.majorChecklist.filter((i) => i.status === "missing").length;
  const present = result.majorChecklist.filter((i) => i.status === "present").length;

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-6 py-12 md:px-16">
      <p className="text-sm font-bold text-[#7C5CDB]">
        {classYear} · {major} · {result.mode === "REQUIRED" ? "Required items checked" : "Suggestions only"}
      </p>
      <p className="mt-3 inline-flex rounded-full bg-[#FBF0E3] px-4 py-1.5 text-sm font-bold text-[#B4711F]">
        Sample results: the AI isn&apos;t connected yet, so this isn&apos;t based on your resume
      </p>
      <h1 className="mt-2 text-3xl font-extrabold text-[#1A1523]">Your results</h1>
      <p className="mt-3 max-w-2xl text-lg text-[#5B5468]">{result.summary}</p>

      <div className="mt-8 max-w-2xl rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#1A1523]">What you&apos;re doing well</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[#5B5468]">
          {result.strengths.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-[#9B96A8]">
          Major checklist: {present} done, {missing} required still missing, out of{" "}
          {result.majorChecklist.length} items. The full results page is coming in the next step.
        </p>
      </div>

      <Link
        href="/optimize"
        className="mt-8 inline-flex rounded-full bg-[#EDE7FB] px-5 py-2.5 font-bold text-[#7C5CDB] hover:bg-[#D9D2F0]"
      >
        ← Check another resume
      </Link>
    </main>
  );
}