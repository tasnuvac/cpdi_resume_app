"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { ResumeCheckResult } from "../../lib/resumePrompt";
import { buildCoachSummary, type SummaryLine } from "../../lib/coachSummary";
import { CPDI_LINKS } from "../../lib/cpdiLinks";

// The coach-ready summary. Two parts:
// 1. A card on the results page (hidden when printing) where the student
//    can add their name and questions, then download the summary.
// 2. The summary sheet itself (only shown when printing). "Download" opens
//    the browser's print dialog, where the student picks "Save as PDF".
//
// The name and questions stay in this browser tab. They're never sent
// anywhere or saved, so the app stays stateless.

export default function CoachSummary({ result, major, classYear, isSample }: {
  result: ResumeCheckResult;
  major: string;
  classYear: string;
  isSample: boolean;
}) {
  const [name, setName] = useState("");
  const [questions, setQuestions] = useState("");
  const [qrCode, setQrCode] = useState("");

  // QR code for the booking link, so a printed copy still gets them there.
  useEffect(() => {
    QRCode.toDataURL(CPDI_LINKS.bookCoaching, { margin: 1, width: 240 })
      .then(setQrCode)
      .catch(() => setQrCode(""));
  }, []);

  const summary = buildCoachSummary(result, major, classYear);
  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <>
      {/* 1. On-screen card */}
      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm md:p-8 print:hidden">
        <h2 className="text-xl font-bold text-[#1A1523]">Bring This to a CPDI Coach</h2>
        <p className="mt-1 text-sm text-[#9B96A8]">
          Download your full results as easy-to-read notes for a coaching appointment. Nothing you type here is saved or sent anywhere.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="coachName" className="text-sm font-bold text-[#1A1523]">
              Your name (optional)
            </label>
            <input
              id="coachName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Only appears on your download"
              className="mt-2 w-full rounded-xl border border-[#EAE6F5] bg-[#FBFAF8] p-3 text-sm text-[#1A1523] focus:outline-none focus:ring-2 focus:ring-[#7C5CDB]"
            />
          </div>
          <div>
            <label htmlFor="coachQuestions" className="text-sm font-bold text-[#1A1523]">
              Questions for my coach (optional)
            </label>
            <textarea
              id="coachQuestions"
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
              rows={3}
              placeholder="Example: How do I describe my research role?"
              className="mt-2 w-full rounded-xl border border-[#EAE6F5] bg-[#FBFAF8] p-3 text-sm text-[#1A1523] focus:outline-none focus:ring-2 focus:ring-[#7C5CDB]"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full bg-[#7C5CDB] px-6 py-3 text-base font-bold text-white transition hover:bg-[#6B4CC7]"
          >
            ⬇ Download for my coaching appointment
          </button>
          <a
            href={CPDI_LINKS.bookCoaching}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full bg-[#EDE7FB] px-6 py-3 text-base font-bold text-[#7C5CDB] transition hover:bg-[#D9D2F0]"
          >
            Book a coaching appointment
          </a>
        </div>
        <p className="mt-3 text-xs text-[#9B96A8]">
          In the window that opens, choose &quot;Save as PDF&quot; as the printer.
        </p>
      </section>

      {/* 2. Printed summary sheet */}
      <div className="hidden text-[10.5pt] leading-snug text-black print:block">
        <style>{"@media print { @page { size: letter; margin: 0.6in; } }"}</style>

        <header className="border-b-2 border-black pb-2">
          <p className="text-[9pt] font-bold uppercase tracking-wide">CCNY CPDI · Resume Readiness Check</p>
          <h1 className="mt-1 text-[18pt] font-bold">Resume Check Summary{name.trim() ? ` for ${name.trim()}` : ""}</h1>
          <p>
            {major} · {classYear} · {date}
          </p>
          {isSample && <p className="mt-1 font-bold">Sample results: the AI isn&apos;t connected yet, so this isn&apos;t based on a real resume.</p>}
        </header>

        <PrintSection title="Your Next Step">
          {summary.nextStep.map((s) => (
            <p key={s}>{s}</p>
          ))}
        </PrintSection>

        <PrintSection title="Overview">
          <p>{summary.overview}</p>
          {summary.strengths.length > 0 && (
            <>
              <p className="mt-2 font-bold">What you&apos;re doing well:</p>
              <ul className="list-disc pl-5">
                {summary.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </>
          )}
        </PrintSection>

        <PrintSection title="CPDI Resume Structure">
          <p className="font-bold">Main sections</p>
          <Lines lines={summary.mainSections} />
          <p className="mt-2 font-bold">Skills section heading</p>
          <Lines lines={[summary.skillsLabel]} hideHeading />
          <p className="mt-2 font-bold">Optional sections</p>
          <Lines lines={summary.optionalSections} />
        </PrintSection>

        <PrintSection title={`For ${major} · ${classYear}`}>
          <p className="break-after-avoid">{summary.checklistIntro}</p>
          {summary.checklist.length > 0 ? (
            <Lines lines={summary.checklist} />
          ) : (
            <p>No major checklist yet. Choosing an intended major adds suggestions for your field.</p>
          )}
          {summary.keywordsFound && <p className="mt-2">{summary.keywordsFound}</p>}
          {summary.keywordsToConsider && <p className="mt-1">{summary.keywordsToConsider}</p>}
        </PrintSection>

        <PrintSection title="Your Next Steps">
          <ol className="list-decimal pl-5">
            {summary.nextSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </PrintSection>

        {summary.spelling.length > 0 && (
          <PrintSection title="Spelling & Grammar">
            <ul className="list-disc pl-5">
              {summary.spelling.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </PrintSection>
        )}

        <PrintSection title="Check Your Formatting">
          <p>The app can&apos;t see fonts or bolding, so check these on your resume:</p>
          <ul className="mt-1 grid grid-cols-2 gap-x-6">
            {summary.formatting.map((rule) => (
              <li key={rule}>☐ {rule}</li>
            ))}
          </ul>
        </PrintSection>

        <PrintSection title="Questions for My Coach">
          {questions.trim() ? (
            <p className="whitespace-pre-wrap">{questions.trim()}</p>
          ) : (
            <div className="space-y-5 pt-2">
              <div className="border-b border-black" />
              <div className="border-b border-black" />
              <div className="border-b border-black" />
            </div>
          )}
        </PrintSection>

        <section className="mt-4 flex items-center gap-4 border-t-2 border-black pt-3 break-inside-avoid">
          {/* eslint-disable-next-line @next/next/no-img-element -- a data URL, so Next's Image adds nothing */}
          {qrCode && <img src={qrCode} alt="QR code to book a CPDI coaching appointment" className="h-20 w-20" />}
          <div>
            <p className="font-bold">Book a CPDI coaching appointment</p>
            <p>Scan the code or go to {CPDI_LINKS.bookCoaching}</p>
          </div>
        </section>
      </div>
    </>
  );
}

function PrintSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <h2 className="mb-1 border-b border-black text-[12pt] font-bold break-after-avoid">{title}</h2>
      {children}
    </section>
  );
}

// One item per block: bold heading, then its sentences. Kept together
// across page breaks so a heading never prints without its feedback.
function Lines({ lines, hideHeading = false }: { lines: SummaryLine[]; hideHeading?: boolean }) {
  return (
    <ul className="mt-1 space-y-1.5">
      {lines.map((line) => (
        <li key={line.heading} className="break-inside-avoid">
          {!hideHeading && <span className="font-bold">{line.heading}: </span>}
          {line.sentences.join(" ")}
        </li>
      ))}
    </ul>
  );
}