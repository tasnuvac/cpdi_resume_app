// Progress codes: lets a student see what improved since their last
// check, without the app storing anything.
//
// Like a save code in an old video game: the code carries the progress,
// not the app. A code holds only the class year, major, date, and the
// status of each checklist item. No resume text, no name, nothing
// personal, so it's safe to copy, paste, or print.
//
// Only "type" imports from resumePrompt, so this file is safe in the browser.

import type { ResumeCheckResult } from "./resumePrompt";

// ------------------------------------------------------------------
// Fixed lists (APPEND ONLY)
// ------------------------------------------------------------------
// A code stores positions in these lists, not names. Never reorder,
// rename, or remove an entry, or old codes will decode to the wrong
// thing. New majors go at the end. These are kept separate from
// majors.ts on purpose, so the dropdown can be reordered freely.
const CODE_VERSION = 1;
const CLASS_YEARS = ["Freshman", "Sophomore", "Junior", "Senior"];
const MAJORS = [
  "Undeclared / Pre-major",
  "Computer Science",
  "Computer Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biomedical Engineering",
  "Earth System Science and Environmental Engineering",
  "Biology",
  "Biotechnology",
  "Biology for Allied Health Professions",
  "Science Learning and Public Engagement",
  "Chemistry",
  "Biochemistry",
  "Physics",
  "Earth and Atmospheric Sciences",
  "Environmental Earth System Science",
  "Mathematics",
  "Biomedical Science (BS/MD)",
  "Anthropology",
  "Strategic Management (BBA)",
  "Entrepreneurship (BBA)",
  "Management and Administration",
  "Economics",
  "Finance (BBA)",
  "International Studies",
  "Latin American and Latino Studies",
  "Political Science",
  "Psychology",
  "Sociology",
  "Architecture",
  "Urban Studies and the Built Environment",
  "Art",
  "Electronic Design and Multimedia",
  "Advertising and Public Relations",
  "Film and Video Production",
  "Popular Music Studies",
  "Sonic Arts: Audio Production",
  "Theatre",
  "Journalism",
  "Jazz Studies (Vocal)",
  "Jazz Studies (Instrumental)",
  "English",
  "Comparative Literature",
  "History",
  "Philosophy",
  "Black Studies",
  "Romance Languages",
  "Asian Studies",
  "Jewish Studies",
  "Interdisciplinary Arts and Science",
  "Art Teacher (All Grades)",
  "English Teacher (Grades 7-12)",
  "Mathematics Teacher (Grades 7-12)",
  "Social Studies Teacher (Grades 7-12)",
  "Spanish Teacher (Grades 7-12)",
  "Biology Teacher (Grades 7-12)",
  "Chemistry Teacher (Grades 7-12)",
  "Earth Science Teacher (Grades 7-12)",
  "Physics Teacher (Grades 7-12)",
  "Childhood Education",
  "Bilingual Childhood Education (Grades 1-6)",
  "Early Childhood Education",
];
const STRUCTURE_IDS = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10"];
const CHECKLIST_IDS = ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8"];

// Each status is stored as a number 0-3.
const STRUCTURE_STATUSES = ["present", "fix", "missing", "notIncluded"] as const;
const SKILLS_STATUSES = ["correct", "wrongLabel", "missing"] as const;
// 0 means "not on this student's checklist" (e.g. no GitHub item for Biology).
const CHECKLIST_STATUSES = ["none", "present", "suggest", "missing"] as const;

// Days are counted from Jan 1, 2026, so 12 bits covers about 11 years.
const EPOCH = Date.UTC(2026, 0, 1);
const DAY_MS = 24 * 60 * 60 * 1000;

// ------------------------------------------------------------------
// What a code holds
// ------------------------------------------------------------------
export type ProgressSnapshot = {
  classYear: string;
  major: string;
  date: Date;
  structure: Record<string, (typeof STRUCTURE_STATUSES)[number]>;
  skills: (typeof SKILLS_STATUSES)[number];
  checklist: Record<string, (typeof CHECKLIST_STATUSES)[number]>;
};

// ------------------------------------------------------------------
// Encoding: 62 bits of data + a 13-bit checksum = 75 bits = 15 letters
// ------------------------------------------------------------------
// Letters that can't be mixed up when typed: no I, L, O, or U.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const DATA_BITS = BigInt(62);
const CHECK_BITS = BigInt(13);
const CODE_LENGTH = 15;

// Catches typos: if any letter is changed, the checksum won't match.
function checksum(data: bigint): bigint {
  let h = BigInt(0x2a5);
  let rest = data;
  for (let i = 0; i < 13; i++) {
    h = (h * BigInt(31) + (rest & BigInt(0x1f))) % BigInt(8191);
    rest >>= BigInt(5);
  }
  return h;
}

export function encodeProgress(result: ResumeCheckResult, major: string, classYear: string, date = new Date()): string | null {
  const yearIndex = CLASS_YEARS.indexOf(classYear);
  const majorIndex = MAJORS.indexOf(major);
  if (yearIndex === -1 || majorIndex === -1) return null;

  // The student's local calendar day, so a late-evening check isn't
  // stored as the next day.
  const localDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const day = Math.min(4095, Math.max(0, Math.floor((localDay - EPOCH) / DAY_MS)));

  // Writes each value into the number, one after another, like filling
  // in boxes on a form from left to right.
  let data = BigInt(0);
  const put = (value: number, bits: number) => {
    data = (data << BigInt(bits)) | BigInt(value);
  };

  put(CODE_VERSION, 3);
  put(yearIndex, 2);
  put(majorIndex, 7);
  put(day, 12);

  const structureById = new Map(result.structure.map((s) => [s.id as string, s.status]));
  for (const id of STRUCTURE_IDS) {
    put(STRUCTURE_STATUSES.indexOf(structureById.get(id) ?? "missing"), 2);
  }

  put(SKILLS_STATUSES.indexOf(result.skillsSection.status), 2);

  const checklistById = new Map(result.majorChecklist.map((c) => [c.id as string, c.status]));
  for (const id of CHECKLIST_IDS) {
    const status = checklistById.get(id);
    put(status ? CHECKLIST_STATUSES.indexOf(status) : 0, 2);
  }

  const full = (data << CHECK_BITS) | checksum(data);

  let letters = "";
  let rest = full;
  for (let i = 0; i < CODE_LENGTH; i++) {
    letters = ALPHABET[Number(rest & BigInt(31))] + letters;
    rest >>= BigInt(5);
  }
  return `RC-${letters.slice(0, 5)}-${letters.slice(5, 10)}-${letters.slice(10)}`;
}

// Returns null if the code is mistyped or not a real code.
export function decodeProgress(code: string): ProgressSnapshot | null {
  // Forgiving about format: ignores "RC", dashes, spaces, and lowercase,
  // and reads I/L as 1 and O as 0, since people mix those up.
  const cleaned = code
    .toUpperCase()
    .replace(/^\s*RC/, "")
    .replace(/[\s-]/g, "")
    .replace(/[IL]/g, "1")
    .replace(/O/g, "0");
  if (cleaned.length !== CODE_LENGTH) return null;

  let full = BigInt(0);
  for (const ch of cleaned) {
    const value = ALPHABET.indexOf(ch);
    if (value === -1) return null;
    full = (full << BigInt(5)) | BigInt(value);
  }

  const data = full >> CHECK_BITS;
  if (checksum(data) !== (full & ((BigInt(1) << CHECK_BITS) - BigInt(1)))) return null;

  // Reads the values back out in the same order they were written.
  let bitsLeft = DATA_BITS;
  const take = (bits: number) => {
    bitsLeft -= BigInt(bits);
    return Number((data >> bitsLeft) & ((BigInt(1) << BigInt(bits)) - BigInt(1)));
  };

  if (take(3) !== CODE_VERSION) return null;
  const classYear = CLASS_YEARS[take(2)];
  const major = MAJORS[take(7)];
  const stored = new Date(EPOCH + take(12) * DAY_MS);
  const date = new Date(stored.getUTCFullYear(), stored.getUTCMonth(), stored.getUTCDate());
  if (!classYear || !major) return null;

  const structure: ProgressSnapshot["structure"] = {};
  for (const id of STRUCTURE_IDS) structure[id] = STRUCTURE_STATUSES[take(2)];

  const skills = SKILLS_STATUSES[take(2)];
  if (!skills) return null;

  const checklist: ProgressSnapshot["checklist"] = {};
  for (const id of CHECKLIST_IDS) checklist[id] = CHECKLIST_STATUSES[take(2)];

  return { classYear, major, date, structure, skills, checklist };
}

// ------------------------------------------------------------------
// Comparing a past check with today's
// ------------------------------------------------------------------
export type ProgressChange = { label: string; from: string; to: string };

export type ProgressComparison = {
  since: Date;
  improved: ProgressChange[];
  needsAttention: ProgressChange[];
  // Items that became required because the student moved up a year
  // (e.g. sophomore → junior). Shown separately so it doesn't look
  // like they got worse when the rules got stricter.
  newlyRequired: ProgressChange[];
  // Major changed: only the CPDI structure is compared, since checklist
  // items mean different things for different majors.
  majorChanged: boolean;
  movedUpYear: boolean;
};

// Higher is better. Missing and "not included" both count as 0, so adding
// an optional section counts as an improvement.
const STRUCTURE_RANK = { missing: 0, notIncluded: 0, fix: 1, present: 2 } as const;
const SKILLS_RANK = { missing: 0, wrongLabel: 1, correct: 2 } as const;
const CHECKLIST_RANK = { missing: 0, suggest: 1, present: 2 } as const;

const WORDS: Record<string, string> = {
  present: "Done",
  fix: "Needs a fix",
  missing: "Missing",
  notIncluded: "Not included",
  correct: "Correct",
  wrongLabel: "Needs renaming",
  suggest: "Suggestion",
};

export function compareProgress(
  previous: ProgressSnapshot,
  current: ResumeCheckResult,
  major: string,
  classYear: string
): ProgressComparison {
  const improved: ProgressChange[] = [];
  const needsAttention: ProgressChange[] = [];
  const newlyRequired: ProgressChange[] = [];
  const majorChanged = previous.major !== major;
  const movedUpYear = CLASS_YEARS.indexOf(classYear) > CLASS_YEARS.indexOf(previous.classYear);

  const record = (label: string, from: string, to: string, before: number, after: number) => {
    if (after > before) improved.push({ label, from: WORDS[from], to: WORDS[to] });
    else if (after < before) needsAttention.push({ label, from: WORDS[from], to: WORDS[to] });
  };

  // 1. CPDI structure: always compared.
  for (const section of current.structure) {
    const before = previous.structure[section.id];
    if (!before) continue;
    record(section.label, before, section.status, STRUCTURE_RANK[before], STRUCTURE_RANK[section.status]);
  }

  // 2. Skills section heading: always compared.
  record(
    "Skills section heading",
    previous.skills,
    current.skillsSection.status,
    SKILLS_RANK[previous.skills],
    SKILLS_RANK[current.skillsSection.status]
  );

  // 3. Major checklist: only when the major is the same.
  if (!majorChanged) {
    for (const item of current.majorChecklist) {
      const before = previous.checklist[item.id];
      if (!before || before === "none") continue;
      // A suggestion that's now required and still to do: the rules got
      // stricter, the student didn't get worse.
      if (movedUpYear && before === "suggest" && item.status === "missing") {
        newlyRequired.push({ label: item.label, from: WORDS.suggest, to: "Required" });
        continue;
      }
      record(item.label, before, item.status, CHECKLIST_RANK[before], CHECKLIST_RANK[item.status]);
    }
  }

  return { since: previous.date, improved, needsAttention, newlyRequired, majorChanged, movedUpYear };
}

// ------------------------------------------------------------------
// Remembering the last code on this device (a convenience only)
// ------------------------------------------------------------------
// Saved in this browser only, never sent anywhere. Wrapped in try/catch
// because private browsing and some school computers block storage.
const STORAGE_KEY = "cpdi_resume_last_code";

export function saveLastCode(code: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Storage blocked: the student can still copy the code themselves.
  }
}

export function readLastCode(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}