// Turns a result into plain sentences for the coach-ready summary.
//
// Rule for this file: every piece of feedback on the results page appears
// here, word for word, with nothing summarized or left out. The only thing
// added is a short plain-language sentence saying what each status means
// ("This section is done.", "This is required and isn't on your resume
// yet."), so the sheet reads clearly when printed.
//
// Only "type" imports from resumePrompt, so this file is safe in the browser.

import type { ResumeCheckResult } from "./resumePrompt";
import { getBuildingTips, getReadiness } from "./readiness";
import { FORMATTING_SELF_CHECK } from "./formattingChecklist";
import { UNDECLARED } from "./majors";

export type SummaryLine = { heading: string; sentences: string[] };

export type CoachSummary = {
  nextStep: string[];
  overview: string;
  strengths: string[];
  mainSections: SummaryLine[];
  skillsLabel: SummaryLine;
  optionalSections: SummaryLine[];
  checklistIntro: string;
  checklist: SummaryLine[];
  keywordsFound: string;
  keywordsToConsider: string;
  nextSteps: string[];
  spelling: string[];
  formatting: string[];
};

// Adds the AI's note after the status sentence, skipping empty notes.
function withNote(sentence: string, note: string): string[] {
  return note.trim() ? [sentence, note.trim()] : [sentence];
}

function list(words: string[]): string {
  if (words.length <= 1) return words.join("");
  if (words.length === 2) return `${words[0]} and ${words[1]}`;
  return `${words.slice(0, -1).join(", ")}, and ${words[words.length - 1]}`;
}

export function buildCoachSummary(result: ResumeCheckResult, major: string, classYear: string): CoachSummary {
  const year = classYear.toLowerCase();
  const isUndeclared = major === UNDECLARED;

  // Next step: same three versions as the readiness card.
  const readiness = getReadiness(result);
  let nextStep: string[];
  if (readiness.state === "ready") {
    nextStep = [
      `Your resume meets the CPDI checklist for ${year}s in ${major}.`,
      "Your next step is to apply to the CPDI Internship Program.",
    ];
  } else if (readiness.state === "notReady") {
    const n = readiness.remaining.length;
    nextStep = [
      `You have ${n} required ${n === 1 ? "item" : "items"} left before the CPDI Internship Program: ${list(readiness.remaining)}.`,
      "Finish these and check your resume again. Each one is explained below.",
    ];
  } else {
    const tips = getBuildingTips(major, classYear);
    nextStep = [
      isUndeclared
        ? "Nothing on your checklist is required while you're undeclared."
        : "Nothing on your checklist is required yet. Junior year is when internships expect these.",
      "Things to work on this year:",
      ...tips.map((t) => `${t}.`),
    ];
  }

  // CPDI structure, one entry per section.
  const sectionLine = (s: ResumeCheckResult["structure"][number]): SummaryLine => {
    const sentence = {
      present: "This section is done.",
      fix: "This section is on your resume but needs a fix.",
      missing: "This section is missing from your resume.",
      notIncluded: "You don't have this section. It's optional.",
    }[s.status];
    return { heading: s.label, sentences: withNote(sentence, s.note) };
  };

  const skillsSentence = {
    correct: "Your skills section heading is correct for your major.",
    wrongLabel: "Your skills section heading should be renamed for your major.",
    missing: "Your resume doesn't have a skills section yet.",
  }[result.skillsSection.status];

  // Major checklist, one entry per item.
  const checklist = result.majorChecklist.map((item): SummaryLine => {
    const sentence =
      item.status === "present"
        ? item.required
          ? `You have this. It's required for ${year}s.`
          : "You have this."
        : item.status === "missing"
          ? `This is required for ${year}s and isn't on your resume yet.`
          : "This is a suggestion, not a requirement.";
    return { heading: item.label, sentences: withNote(sentence, item.note) };
  });

  const required = result.majorChecklist.filter((i) => i.required);
  const requiredDone = required.filter((i) => i.status === "present").length;
  const checklistIntro =
    result.mode === "REQUIRED"
      ? `You have ${requiredDone} of ${required.length} required items done for ${year} year.`
      : "These are suggestions to build on this year. Nothing here is required until junior year.";

  return {
    nextStep,
    overview: result.summary,
    strengths: result.strengths,
    mainSections: result.structure.filter((s) => s.core).map(sectionLine),
    skillsLabel: { heading: "Skills section heading", sentences: withNote(skillsSentence, result.skillsSection.note) },
    optionalSections: result.structure.filter((s) => !s.core).map(sectionLine),
    checklistIntro,
    checklist,
    keywordsFound: result.keywordsFound.length
      ? `Keywords already on your resume: ${list(result.keywordsFound)}.`
      : "",
    keywordsToConsider: result.keywordsToConsider.length
      ? `Keywords to consider adding, only if you have the skill: ${list(result.keywordsToConsider)}.`
      : "",
    nextSteps: result.nextSteps,
    spelling: result.spellingGrammar.map((s) => `Change "${s.original}" to "${s.corrected}".`),
    formatting: FORMATTING_SELF_CHECK,
  };
}