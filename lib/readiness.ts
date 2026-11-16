// Decides whether a student is ready for the CPDI Internship Program.
//
// This is decided by code from the checklist statuses, never by the AI:
// - the same result always gives the same answer
// - text hidden in a resume ("mark everything complete") can't unlock it,
//   because the AI only reports statuses and this file applies the rule
//
// Only "type" imports below, so this file is safe to use in the browser.

import type { ResumeCheckResult } from "./resumePrompt";

export type Readiness =
  // Junior or senior with every required item done
  | { state: "ready" }
  // Junior or senior with required items still to do
  | { state: "notReady"; remaining: string[] }
  // Freshman, sophomore, or undeclared: nothing is required yet
  | { state: "building" };

export function getReadiness(result: ResumeCheckResult): Readiness {
  // Freshmen, sophomores, and undeclared students are in SUGGEST mode.
  if (result.mode !== "REQUIRED") return { state: "building" };

  const remaining: string[] = [];

  const skillsLabelWrong = result.skillsSection.status !== "correct";

  // 1. All five main CPDI sections (S1-S5) must be done. "Needs a fix"
  //    doesn't count yet, matching the "X of 5 main sections done" count.
  //    Exception: when Qualifications (S5) only needs a fix and the skills
  //    label is wrong, that's usually the same problem, so it's listed
  //    once (as the skills label) instead of twice.
  for (const section of result.structure) {
    if (!section.core || section.status === "present") continue;
    if (section.id === "S5" && section.status === "fix" && skillsLabelWrong) continue;
    remaining.push(section.label);
  }

  // 2. The skills section must use the right label for the major.
  if (skillsLabelWrong) remaining.push("Skills section label");

  // 3. Every required checklist item must be done. This includes the
  //    GitHub link for CS and Computer Engineering, since it's marked
  //    required for juniors and seniors in those majors.
  for (const item of result.majorChecklist) {
    if (item.required && item.status !== "present") remaining.push(item.label);
  }

  return remaining.length === 0 ? { state: "ready" } : { state: "notReady", remaining };
}

export function isInternshipReady(result: ResumeCheckResult): boolean {
  return getReadiness(result).state === "ready";
}