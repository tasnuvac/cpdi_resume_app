import type { ResumeCheckResult } from "../../lib/resumePrompt";
import { getReadiness } from "../../lib/readiness";
import { CPDI_LINKS } from "../../lib/cpdiLinks";
import { UNDECLARED } from "../../lib/majors";

// The card at the top of the results page that points each student to
// their next CPDI step. Three versions:
// - ready:    junior/senior with every required item done → Internship Program
// - notReady: junior/senior with items left → what's left, plus coaching
// - building: freshman/sophomore/undeclared → what to build this year
//
// Wording says "meets the CPDI checklist", not "guaranteed ready".
// Waiting on Devika's approval of this wording before the pilot.

// What to focus on before junior year, by class year.
const BUILDING_TIPS: Record<string, string[]> = {
  Freshman: [
    "Join a club related to your major",
    "Turn a class project into a Projects entry on your resume",
    "Go to a CPDI workshop to start building your skills list",
  ],
  Sophomore: [
    "Apply to the CPDI Internship Program",
    "Look for a lab, research, or project role in your major",
    "Join a club or society in your field",
  ],
};

const UNDECLARED_TIPS = [
  "Meet with a CPDI coach to explore majors and careers",
  "Get your resume into the CPDI structure now, so it's ready when you declare",
  "Try a club or workshop in a field you're considering",
];

export default function ReadinessCard({ result, major, classYear }: {
  result: ResumeCheckResult;
  major: string;
  classYear: string;
}) {
  const readiness = getReadiness(result);

  if (readiness.state === "ready") {
    return (
      <section className="rounded-2xl border-2 border-[#2F9E5B] bg-[#EAF7EE] p-6 md:p-8">
        <p className="text-xs font-bold tracking-wide text-[#2F9E5B]">🎉 NEXT STEP UNLOCKED</p>
        <h2 className="mt-2 text-2xl font-extrabold text-[#1A1523]">
          You&apos;re ready for the CPDI Internship Program
        </h2>
        <p className="mt-2 text-base text-[#5B5468]">
          Your resume meets the CPDI checklist for {classYear.toLowerCase()}s in {major}. Take the next step and apply.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={CPDI_LINKS.internshipProgram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#2F9E5B] px-6 py-3 text-base font-bold text-white transition hover:bg-[#268A4E]"
          >
            Apply to the Internship Program <span aria-hidden="true">→</span>
          </a>
          <a
            href={CPDI_LINKS.bookCoaching}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full bg-white px-6 py-3 text-base font-bold text-[#2F9E5B] transition hover:bg-[#D7EFDF]"
          >
            Book a coaching session
          </a>
        </div>
      </section>
    );
  }

  if (readiness.state === "notReady") {
    const count = readiness.remaining.length;
    return (
      <section className="rounded-2xl border-2 border-[#F0D3AE] bg-[#FBF0E3] p-6 md:p-8">
        <p className="text-xs font-bold tracking-wide text-[#B4711F]">ALMOST THERE</p>
        <h2 className="mt-2 text-2xl font-extrabold text-[#1A1523]">
          {count} required {count === 1 ? "item" : "items"} left before the Internship Program
        </h2>
        <p className="mt-2 text-base text-[#5B5468]">
          Finish these and check again. The details for each are in the checklists below.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {readiness.remaining.map((label) => (
            <li key={label} className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[#B4711F]">
              {label}
            </li>
          ))}
        </ul>
        <a
          href={CPDI_LINKS.bookCoaching}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#B4711F] px-6 py-3 text-base font-bold text-white transition hover:bg-[#9C611A]"
        >
          Get help from a CPDI coach <span aria-hidden="true">→</span>
        </a>
      </section>
    );
  }

  // building: freshman, sophomore, or undeclared
  const isUndeclared = major === UNDECLARED;
  const tips = isUndeclared ? UNDECLARED_TIPS : BUILDING_TIPS[classYear] ?? BUILDING_TIPS.Freshman;
  return (
    <section className="rounded-2xl border-2 border-[#D9D2F0] bg-[#F3EFFC] p-6 md:p-8">
      <p className="text-xs font-bold tracking-wide text-[#7C5CDB]">WHAT TO BUILD THIS YEAR</p>
      <h2 className="mt-2 text-2xl font-extrabold text-[#1A1523]">
        {isUndeclared ? "Build a strong foundation while you explore" : `Set yourself up for junior year`}
      </h2>
      <p className="mt-2 text-base text-[#5B5468]">
        {isUndeclared
          ? "Nothing on your checklist is required while you're undeclared. Start with these:"
          : "Nothing on your checklist is required yet. Junior year is when internships expect these, so start now:"}
      </p>
      <ul className="mt-4 space-y-2">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-2 text-sm text-[#1A1523]">
            <span className="text-[#7C5CDB]" aria-hidden="true">→</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
      <a
        href={CPDI_LINKS.bookCoaching}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#7C5CDB] px-6 py-3 text-base font-bold text-white transition hover:bg-[#6B4CC7]"
      >
        Talk to a CPDI coach <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}