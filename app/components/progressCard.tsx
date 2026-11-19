"use client";

import { useEffect, useState } from "react";
import type { ResumeCheckResult } from "../../lib/resumePrompt";
import { compareProgress, decodeProgress, saveLastCode, type ProgressChange } from "../../lib/progressCode";

// "Your Progress" card on the results page:
// - with a code from last time: shows what improved since then
// - always: shows this check's code to save for next time
export default function ProgressCard({ result, major, classYear, code, previousCode }: {
  result: ResumeCheckResult;
  major: string;
  classYear: string;
  code: string | null;
  previousCode: string;
}) {
  const [copied, setCopied] = useState(false);

  // Remember this code on this device, so the upload page can offer it
  // next time. Only a convenience: the student can always paste it.
  useEffect(() => {
    if (code) saveLastCode(code);
  }, [code]);

  if (!code) return null;

  const previous = previousCode.trim() ? decodeProgress(previousCode) : null;
  const comparison = previous ? compareProgress(previous, result, major, classYear) : null;

  async function copyCode(input: HTMLInputElement | null) {
    try {
      await navigator.clipboard.writeText(code!);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: select the text so the student can copy it.
      input?.select();
    }
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-xl font-bold text-[#1A1523]">Your Progress</h2>

      {comparison ? (
        <Comparison comparison={comparison} classYear={classYear} />
      ) : (
        <p className="mt-1 text-sm text-[#5B5468]">
          Save the code below. Next time you check your resume, paste it in and we&apos;ll show you what improved.
        </p>
      )}

      <div className="mt-5 rounded-xl bg-[#F3EFFC] p-4">
        <label htmlFor="progressCodeOut" className="text-xs font-bold tracking-wide text-[#7C5CDB]">
          YOUR PROGRESS CODE FOR THIS CHECK
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <input
            id="progressCodeOut"
            readOnly
            value={code}
            onFocus={(e) => e.target.select()}
            className="min-w-0 flex-1 rounded-lg bg-white px-3 py-2 font-mono text-lg font-bold tracking-wider text-[#1A1523]"
          />
          <button
            type="button"
            onClick={(e) => copyCode(e.currentTarget.parentElement?.querySelector("input") ?? null)}
            className="rounded-full bg-[#7C5CDB] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#6B4CC7]"
          >
            {copied ? "✓ Copied" : "Copy code"}
          </button>
        </div>
        <p className="mt-2 text-xs text-[#5B5468]">
          The code only holds your checklist results: no name, no resume text. We don&apos;t store it, so keep it somewhere you&apos;ll find it.
        </p>
      </div>
    </section>
  );
}

function Comparison({ comparison, classYear }: {
  comparison: ReturnType<typeof compareProgress>;
  classYear: string;
}) {
  const { since, improved, needsAttention, newlyRequired, majorChanged } = comparison;
  const date = since.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const n = improved.length;
  const nothingChanged = n === 0 && needsAttention.length === 0 && newlyRequired.length === 0;

  return (
    <div className="mt-2">
      <p className="text-2xl font-extrabold text-[#1A1523]">
        {nothingChanged
          ? `No changes since ${date}`
          : n > 0
            ? `🎉 ${n} ${n === 1 ? "item" : "items"} improved since ${date}`
            : `Since ${date}`}
      </p>

      {majorChanged && (
        <p className="mt-1 text-sm text-[#9B96A8]">
          Your major changed since that check, so we compared your CPDI structure only.
        </p>
      )}
      {nothingChanged && (
        <p className="mt-1 text-sm text-[#5B5468]">Your next steps below show where to start.</p>
      )}

      <ChangeList title="IMPROVED" items={improved} chip="bg-[#EAF7EE] text-[#2F9E5B]" />
      <ChangeList
        title={`NEW FOR ${classYear.toUpperCase()} YEAR`}
        note="These were suggestions before. Now they're required for your class year."
        items={newlyRequired}
        chip="bg-[#F3EFFC] text-[#7C5CDB]"
      />
      <ChangeList
        title="NEEDS ANOTHER LOOK"
        note="If you didn't change one of these, it may have been read differently this time. Check the note for it below."
        items={needsAttention}
        chip="bg-[#FBF0E3] text-[#B4711F]"
      />
    </div>
  );
}

function ChangeList({ title, note, items, chip }: {
  title: string;
  note?: string;
  items: ProgressChange[];
  chip: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-4">
      <p className="text-xs font-bold tracking-wide text-[#5B5468]">{title}</p>
      {note && <p className="mt-0.5 text-xs text-[#9B96A8]">{note}</p>}
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.label} className={`rounded-full px-3 py-1.5 text-sm font-bold ${chip}`}>
            {item.label}: {item.from} → {item.to}
          </li>
        ))}
      </ul>
    </div>
  );
}