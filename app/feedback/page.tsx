"use client";

import Image from "next/image";
import Link from "next/link";
import ErrorModal from "../components/errorModal";
import MoreServicesButton from "../components/moreServicesButton";
import { useResumeContext } from "../context/ResumeContext";
import {
  FormattingCard,
  MajorChecklistCard,
  NextStepsCard,
  SpellingCard,
  StructureCard,
  SummaryCard,
} from "../components/resultSections";

// Shows the label saying these are sample results. Set to false in step 10,
// once the loading page sends the real resume to the AI.
const SHOW_SAMPLE_LABEL = true;

export default function FeedbackPage() {
  const { result, major, classYear } = useResumeContext();

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-6 py-12 md:px-16">
      {/* No result: the student refreshed (which clears in-memory state) or
          the check failed. The modal sits on top of the page shell, the same
          pattern the cover letter app uses. */}
      {!result && (
        <ErrorModal
          title="No results to show"
          message="Your results clear when the page refreshes. Upload your resume again to run a new check."
          buttonText="Go to Resume Check"
          buttonHref="/optimize"
        />
      )}

      {/* Top nav row with centered logo */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex justify-self-start gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#EDE7FB] px-5 py-2.5 text-base font-bold text-[#7C5CDB] transition hover:bg-[#D9D2F0]"
          >
            🏠 Home
          </Link>
          {result && (
            <Link
              href="/optimize"
              className="inline-flex items-center gap-2.5 rounded-full bg-[#EDE7FB] px-5 py-2.5 text-base font-bold text-[#7C5CDB] transition hover:bg-[#D9D2F0]"
            >
              ✏️ Check Another Resume
            </Link>
          )}
        </div>
        <div className="justify-self-center">
          <Image
            src="/cpdi-logo.png"
            alt="CCNY Career & Professional Development Institute logo"
            width={340}
            height={101}
            priority
          />
        </div>
        <div className="flex justify-self-end gap-3">
          {result && <MoreServicesButton />}
          <a
            href="https://ccny-csm.symplicity.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#EDE7FB] px-5 py-2.5 text-base font-bold text-[#7C5CDB] transition hover:bg-[#D9D2F0]"
          >
            🔗 Career Connections
          </a>
        </div>
      </div>

      <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-[#1A1523]">Your Results</h1>

      {result && (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-[#EDE7FB] px-4 py-1.5 text-sm font-bold text-[#7C5CDB]">
              {classYear} · {major} · {result.mode === "REQUIRED" ? "Required items checked" : "Suggestions only"}
            </span>
            {SHOW_SAMPLE_LABEL && (
              <span className="inline-flex rounded-full bg-[#FBF0E3] px-4 py-1.5 text-sm font-bold text-[#B4711F]">
                Sample results: the AI isn&apos;t connected yet, so this isn&apos;t based on your resume
              </span>
            )}
          </div>

          {/* Order top to bottom: overview, the two checklists side by
              side, then what to do next. */}
          <div className="mt-8 space-y-6">
            <SummaryCard result={result} />

            <div className="grid gap-6 md:grid-cols-2">
              <StructureCard result={result} />
              <MajorChecklistCard result={result} major={major} classYear={classYear} />
            </div>

            <NextStepsCard steps={result.nextSteps} />
            <SpellingCard items={result.spellingGrammar} />
            <FormattingCard />
          </div>
        </>
      )}
    </main>
  );
}