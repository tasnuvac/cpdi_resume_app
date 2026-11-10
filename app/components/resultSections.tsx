"use client";

import { useState, type ReactNode } from "react";
import type { ChecklistStatus, ResumeCheckResult, StructureStatus } from "../../lib/resumePrompt";
import { FORMATTING_SELF_CHECK } from "../../lib/formattingChecklist";

// The building blocks of the results page. Each card reads one part of
// the result, so the page itself only decides the layout.
//
// Colors follow the cover letter app: green = done, orange = needs work,
// purple = suggestion or tip, grey = optional.

// ------------------------------------------------------------------
// Status badges
// ------------------------------------------------------------------
type Tone = "good" | "fix" | "missing" | "suggest" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  good: "bg-[#EAF7EE] text-[#2F9E5B]",
  fix: "bg-[#FBF0E3] text-[#B4711F]",
  missing: "bg-[#B4711F] text-white",
  suggest: "bg-[#F3EFFC] text-[#7C5CDB]",
  neutral: "bg-[#F1EFF4] text-[#9B96A8]",
};

const STRUCTURE_BADGES: Record<StructureStatus, { tone: Tone; label: string }> = {
  present: { tone: "good", label: "✓ Done" },
  fix: { tone: "fix", label: "Needs a fix" },
  missing: { tone: "missing", label: "Missing" },
  notIncluded: { tone: "neutral", label: "Optional" },
};

const CHECKLIST_BADGES: Record<ChecklistStatus, { tone: Tone; label: string }> = {
  present: { tone: "good", label: "✓ Done" },
  suggest: { tone: "suggest", label: "Suggestion" },
  missing: { tone: "missing", label: "To do" },
};

const SKILLS_BADGES: Record<ResumeCheckResult["skillsSection"]["status"], { tone: Tone; label: string }> = {
  correct: { tone: "good", label: "✓ Correct" },
  wrongLabel: { tone: "fix", label: "Rename it" },
  missing: { tone: "missing", label: "Missing" },
};

function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex flex-none items-center rounded-full px-2.5 py-1 text-xs font-bold ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}

// ------------------------------------------------------------------
// Shared layout pieces
// ------------------------------------------------------------------
function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-xl font-bold text-[#1A1523]">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-[#9B96A8]">{subtitle}</p>}
      {children}
    </section>
  );
}

function SectionLabel({ color, children }: { color: string; children: ReactNode }) {
  return <p className={`mt-6 text-xs font-bold tracking-wide ${color}`}>{children}</p>;
}

// One row in a checklist: name, badge, and the AI's note underneath.
function Row({ label, tag, badge, note, muted = false }: {
  label: string;
  tag?: string;
  badge: ReactNode;
  note?: string;
  muted?: boolean;
}) {
  return (
    <li className="py-3">
      <div className="flex items-start justify-between gap-3">
        <p className={`text-sm font-bold ${muted ? "text-[#9B96A8]" : "text-[#1A1523]"}`}>
          {label}
          {tag && <span className="ml-2 text-xs font-normal text-[#9B96A8]">{tag}</span>}
        </p>
        {badge}
      </div>
      {note && <p className="mt-1 text-sm text-[#5B5468]">{note}</p>}
    </li>
  );
}

// ------------------------------------------------------------------
// 1. Summary and strengths
// ------------------------------------------------------------------
export function SummaryCard({ result }: { result: ResumeCheckResult }) {
  return (
    <Card title="Overview">
      <p className="mt-3 text-base leading-relaxed text-[#1A1523]">{result.summary}</p>
      {result.strengths.length > 0 && (
        <>
          <SectionLabel color="text-[#2F9E5B]">WHAT YOU&apos;RE DOING WELL</SectionLabel>
          <ul className="mt-3 space-y-2 rounded-xl bg-[#EAF7EE] p-4">
            {result.strengths.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-[#1A1523]">
                <span className="text-[#2F9E5B]" aria-hidden="true">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

// ------------------------------------------------------------------
// 2 + 3. CPDI structure (S1-S10) and the skills label check
// ------------------------------------------------------------------
export function StructureCard({ result }: { result: ResumeCheckResult }) {
  const core = result.structure.filter((s) => s.core);
  const optional = result.structure.filter((s) => !s.core);
  const coreDone = core.filter((s) => s.status === "present").length;

  return (
    <Card
      title="CPDI Resume Structure"
      subtitle={`${coreDone} of ${core.length} main sections done. Optional sections help but aren't required.`}
    >
      <SectionLabel color="text-[#7C5CDB]">MAIN SECTIONS</SectionLabel>
      <ul className="divide-y divide-[#F1EFF4]">
        {core.map((s) => (
          <Row
            key={s.id}
            label={s.label}
            badge={<Badge tone={STRUCTURE_BADGES[s.status].tone}>{STRUCTURE_BADGES[s.status].label}</Badge>}
            note={s.note}
          />
        ))}
      </ul>

      <SectionLabel color="text-[#7C5CDB]">SKILLS SECTION LABEL</SectionLabel>
      <ul>
        <Row
          label="Heading matches your major"
          badge={
            <Badge tone={SKILLS_BADGES[result.skillsSection.status].tone}>
              {SKILLS_BADGES[result.skillsSection.status].label}
            </Badge>
          }
          note={result.skillsSection.note}
        />
      </ul>

      <SectionLabel color="text-[#9B96A8]">OPTIONAL SECTIONS</SectionLabel>
      <ul className="divide-y divide-[#F1EFF4]">
        {optional.map((s) => (
          <Row
            key={s.id}
            label={s.label}
            muted={s.status === "notIncluded"}
            badge={<Badge tone={STRUCTURE_BADGES[s.status].tone}>{STRUCTURE_BADGES[s.status].label}</Badge>}
            note={s.note}
          />
        ))}
      </ul>
    </Card>
  );
}

// ------------------------------------------------------------------
// 4 + 5. Major checklist (C1-C8) and keywords
// ------------------------------------------------------------------
export function MajorChecklistCard({ result, major, classYear }: {
  result: ResumeCheckResult;
  major: string;
  classYear: string;
}) {
  const required = result.majorChecklist.filter((i) => i.required);
  const requiredDone = required.filter((i) => i.status === "present").length;
  const subtitle =
    result.mode === "REQUIRED"
      ? `${requiredDone} of ${required.length} required items done for ${classYear.toLowerCase()} year.`
      : `Suggestions to build on this year. Nothing here is required until junior year.`;

  return (
    <Card title={`For ${major} · ${classYear}`} subtitle={subtitle}>
      {result.majorChecklist.length > 0 ? (
        <ul className="mt-2 divide-y divide-[#F1EFF4]">
          {result.majorChecklist.map((item) => (
            <Row
              key={item.id}
              label={item.label}
              tag={item.required ? "Required" : undefined}
              badge={<Badge tone={CHECKLIST_BADGES[item.status].tone}>{CHECKLIST_BADGES[item.status].label}</Badge>}
              note={item.note}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-xl bg-[#F3EFFC] p-4 text-sm text-[#5B5468]">
          Choose an intended major on the form to get suggestions for your field. For now, focus on the CPDI structure.
        </p>
      )}

      {result.keywordsFound.length > 0 && (
        <>
          <SectionLabel color="text-[#2F9E5B]">KEYWORDS ALREADY ON YOUR RESUME</SectionLabel>
          <KeywordChips words={result.keywordsFound} className="bg-[#EAF7EE] text-[#2F9E5B]" />
        </>
      )}
      {result.keywordsToConsider.length > 0 && (
        <>
          <SectionLabel color="text-[#7C5CDB]">KEYWORDS TO CONSIDER</SectionLabel>
          <p className="mt-1 text-xs text-[#9B96A8]">Add these only if you have the skill. Interviewers ask about everything listed.</p>
          <KeywordChips words={result.keywordsToConsider} className="bg-[#F3EFFC] text-[#7C5CDB]" />
        </>
      )}
    </Card>
  );
}

function KeywordChips({ words, className }: { words: string[]; className: string }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {words.map((w) => (
        <span key={w} className={`rounded-full px-3 py-1 text-xs font-bold ${className}`}>
          {w}
        </span>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------
// 6. Next steps
// ------------------------------------------------------------------
export function NextStepsCard({ steps }: { steps: string[] }) {
  return (
    <Card title="Your Next Steps" subtitle="Start with these, in this order.">
      <ol className="mt-4 space-y-3">
        {steps.map((step, i) => (
          <li key={step} className="flex gap-3 text-sm text-[#1A1523]">
            <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#7C5CDB] text-xs font-bold text-white">
              {i + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

// ------------------------------------------------------------------
// 7. Spelling and grammar (hidden when there's nothing to fix)
// ------------------------------------------------------------------
export function SpellingCard({ items }: { items: ResumeCheckResult["spellingGrammar"] }) {
  if (items.length === 0) return null;
  return (
    <Card title="Spelling & Grammar" subtitle="Quick fixes we spotted.">
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.original} className="flex flex-wrap items-center gap-2 rounded-xl bg-[#FBF0E3] px-4 py-3 text-sm">
            <span className="text-[#B4711F] line-through">{item.original}</span>
            <span className="text-[#9B96A8]" aria-hidden="true">→</span>
            <span className="font-bold text-[#1A1523]">{item.corrected}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// ------------------------------------------------------------------
// 8. Formatting self-check (fixed list, no AI)
// ------------------------------------------------------------------
export function FormattingCard() {
  // Ticks are just for the student while they look; they aren't saved.
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(rule: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(rule)) next.delete(rule);
      else next.add(rule);
      return next;
    });
  }

  return (
    <Card
      title="Check Your Formatting"
      subtitle="We can't see fonts or bolding in an upload, so open your resume and check these yourself."
    >
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {FORMATTING_SELF_CHECK.map((rule, i) => (
          <li key={rule}>
            <label
              htmlFor={`format-${i}`}
              className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#FBFAF8] px-4 py-3 text-sm text-[#1A1523]"
            >
              <input
                id={`format-${i}`}
                type="checkbox"
                checked={checked.has(rule)}
                onChange={() => toggle(rule)}
                className="h-4 w-4 accent-[#7C5CDB]"
              />
              {rule}
            </label>
          </li>
        ))}
      </ul>
    </Card>
  );
}