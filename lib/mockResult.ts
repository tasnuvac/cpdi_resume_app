// Fake results for building and testing the results page without Gemini.
//
// Each mock has exactly the shape finalizeResult() returns, so when the AI
// is connected the real result drops into the same place and the pages
// don't change. Keep these around afterwards for testing the UI without
// spending tokens.
//
// "import type" only borrows the types. It's removed when the app is
// built, so majorRequirements.ts still never reaches students' browsers.

import type { ChecklistItem, ChecklistStatus, ResumeCheckResult, StructureStatus } from "./resumePrompt";

// ------------------------------------------------------------------
// Helpers (labels copied from resumePrompt.ts so this file stays
// browser-safe; keep them in sync if the labels there change)
// ------------------------------------------------------------------
const SECTIONS = [
  { id: "S1", label: "Header", core: true },
  { id: "S2", label: "Branding Statement", core: true },
  { id: "S3", label: "Education", core: true },
  { id: "S4", label: "Relevant Coursework", core: true },
  { id: "S5", label: "Qualifications", core: true },
  { id: "S6", label: "Projects", core: false },
  { id: "S7", label: "Professional Development", core: false },
  { id: "S8", label: "Experience", core: false },
  { id: "S9", label: "Affiliations", core: false },
  { id: "S10", label: "Honors/Awards", core: false },
] as const;

type SectionInput = Record<(typeof SECTIONS)[number]["id"], [StructureStatus, string]>;

function structure(input: SectionInput): ResumeCheckResult["structure"] {
  return SECTIONS.map((s) => ({ ...s, status: input[s.id][0], note: input[s.id][1] }));
}

function checklist(
  items: ChecklistItem[],
  input: Partial<Record<ChecklistItem["id"], [ChecklistStatus, string]>>
): ResumeCheckResult["majorChecklist"] {
  return items.map((item) => {
    const [status, note] = input[item.id] ?? ["suggest", ""];
    return { ...item, status, note };
  });
}

// The exact checklist buildChecklist() produces for these students.
const CS_JUNIOR_ITEMS: ChecklistItem[] = [
  { id: "C1", label: "Major keywords in your Technical Skills section", detail: "Skills section lists major keywords. Look for: Python, Java, C++, SQL, Git", required: true },
  { id: "C2", label: "Hands-on experience in your major", detail: "Applied major experience: internship, research, or a substantial project. Counts: projects with a GitHub repo", required: true },
  { id: "C3", label: "Bullets that show results", detail: "Experience or project bullets start with action verbs and show numbers or outcomes", required: true },
  { id: "C4", label: "GitHub link in your header", detail: "GitHub link in the header (shown as [GITHUB] if present)", required: true },
  { id: "C5", label: "No high school content", detail: "No high school activities, jobs, or awards", required: true },
  { id: "C7", label: "Leadership in a club or organization", detail: "A leadership role in a club, society, or organization", required: false },
  { id: "C8", label: "Professional development", detail: "Workshops, certifications, online courses, hackathons, or research programs", required: false },
];

const BIO_FRESHMAN_ITEMS: ChecklistItem[] = [
  { id: "C1", label: "Major keywords in your Lab Skills section", detail: "Skills section lists major keywords. Look for: PCR, gel electrophoresis, cell culture", required: false },
  { id: "C2", label: "Hands-on experience in your major", detail: "Applied major experience: internship, research, or a substantial project. Counts: research lab or REU", required: false },
  { id: "C3", label: "Bullets that show results", detail: "Experience or project bullets start with action verbs and show numbers or outcomes", required: false },
  { id: "C6", label: "Extras for your major", detail: "Certs: CITI or lab safety", required: false },
  { id: "C7", label: "A club related to your major", detail: "Membership in a club or society related to the major", required: false },
  { id: "C8", label: "Professional development", detail: "Workshops, certifications, online courses, hackathons, or research programs", required: false },
];

const ME_SOPHOMORE_ITEMS: ChecklistItem[] = [
  { id: "C1", label: "Major keywords in your Technical Skills section", detail: "Skills section lists major keywords. Look for: SolidWorks, AutoCAD, ANSYS", required: false },
  { id: "C2", label: "Hands-on experience in your major", detail: "Applied major experience: internship, research, or a substantial project. Counts: CAD or design project", required: false },
  { id: "C3", label: "Bullets that show results", detail: "Experience or project bullets start with action verbs and show numbers or outcomes", required: false },
  { id: "C5", label: "No high school content", detail: "No high school activities, jobs, or awards", required: false },
  { id: "C6", label: "Extras for your major", detail: "Society: ASME", required: false },
  { id: "C7", label: "A club related to your major", detail: "Membership in a club or society related to the major", required: false },
  { id: "C8", label: "Professional development", detail: "Workshops, certifications, online courses, hackathons, or research programs", required: false },
];

const PSY_SENIOR_ITEMS: ChecklistItem[] = [
  { id: "C1", label: "Major keywords in your Key Skills section", detail: "Skills section lists major keywords. Look for: research methods, SPSS, R, Qualtrics", required: true },
  { id: "C2", label: "Internship or research with measurable results", detail: "An internship or research position in the major with measurable results. Counts: research lab assistant", required: true },
  { id: "C3", label: "Bullets that show results", detail: "Experience or project bullets start with action verbs and show numbers or outcomes", required: true },
  { id: "C5", label: "No high school content", detail: "No high school activities, jobs, or awards", required: true },
  { id: "C6", label: "Extras for your major", detail: "Certs: CITI human subjects", required: false },
  { id: "C7", label: "Leadership in a club or organization", detail: "A leadership role in a club, society, or organization", required: false },
  { id: "C8", label: "Professional development", detail: "Workshops, certifications, online courses, hackathons, or research programs", required: false },
];

// ------------------------------------------------------------------
// 1. Computer Science junior who meets every requirement
//    → should unlock the CPDI Internship Program card
// ------------------------------------------------------------------
export const MOCK_CS_JUNIOR_READY: ResumeCheckResult = {
  isResume: true,
  mode: "REQUIRED",
  summary:
    "Your resume follows the CPDI structure and covers every junior requirement for Computer Science. Your Tech Fellow internship and GitHub projects make a strong case for internship roles.",
  strengths: [
    "Your internship bullet \"reduced page load time by 40%\" shows clear, measurable impact.",
    "Your branding statement names software engineering internships, so recruiters know exactly what you want.",
    "Your Technical Skills list matches the languages used in your projects.",
  ],
  structure: structure({
    S1: ["present", "Name, New York, NY, email, phone, LinkedIn, and GitHub are all in your header."],
    S2: ["present", "\"Computer Science junior seeking software engineering internships\" is clear and specific."],
    S3: ["present", "Degree, The City College of New York, and May 2028 graduation are all listed."],
    S4: ["present", "Data Structures, Algorithms, and Software Design match the roles you're targeting."],
    S5: ["present", "Technical Skills, Key Skills, and Languages are all included."],
    S6: ["present", "\"Campus Events App\" explains purpose, process, and outcome with your semester."],
    S7: ["present", "Your HackCUNY hackathon entry shows initiative outside class."],
    S8: ["present", "Your Tech Fellow internship uses the CPDI overview paragraph plus bullets."],
    S9: ["present", "ACM chapter membership is listed with dates."],
    S10: ["notIncluded", ""],
  }),
  skillsSection: { status: "correct", note: "Labeled Technical Skills, which is right for Computer Science." },
  majorChecklist: checklist(CS_JUNIOR_ITEMS, {
    C1: ["present", "\"Python, Java, SQL, Git\" are in your Technical Skills."],
    C2: ["present", "Your Tech Fellow software internship counts as applied experience."],
    C3: ["present", "\"Reduced page load time by 40%\" shows results with a number."],
    C4: ["present", "Your GitHub link is in the header."],
    C5: ["present", "No high school content. Your resume is fully college-focused."],
    C7: ["suggest", "You're an ACM member. Running for an officer role would add leadership to your Affiliations."],
    C8: ["present", "HackCUNY counts as professional development."],
  }),
  keywordsFound: ["Python", "Java", "SQL", "Git", "React", "REST APIs"],
  keywordsToConsider: ["C++", "unit testing"],
  nextSteps: [
    "Add a test framework to your Campus Events App and list \"unit testing\" in Technical Skills.",
    "Ask your ACM chapter about officer roles to add leadership to Affiliations.",
    "Apply to the CPDI Internship Program now that your resume meets the junior checklist.",
  ],
  spellingGrammar: [],
};

// ------------------------------------------------------------------
// 2. Computer Science junior with required items still open
//    → should show the required items still to do
// ------------------------------------------------------------------
export const MOCK_CS_JUNIOR_NOT_READY: ResumeCheckResult = {
  isResume: true,
  mode: "REQUIRED",
  summary:
    "You have solid coursework and a real project, so the foundation is there. Adding a branding statement, a GitHub link, and numbers in your bullets will meet the junior requirements.",
  strengths: [
    "Your \"Library Management System\" project shows you can build a full application.",
    "Relevant Coursework lists Data Structures and Databases, which match software roles.",
  ],
  structure: structure({
    S1: ["fix", "Header has email and phone. Add your LinkedIn URL and City, State."],
    S2: ["missing", "Add 1-3 sentences naming your major and the internships you want, right under your header."],
    S3: ["present", "Degree, The City College of New York, and graduation date are listed."],
    S4: ["present", "Data Structures and Databases are good choices for software roles."],
    S5: ["fix", "Your skills heading says \"Skills.\" Rename it \"Technical Skills\" to match CPDI format."],
    S6: ["present", "\"Library Management System\" is listed with the semester."],
    S7: ["notIncluded", ""],
    S8: ["present", "Your Best Buy job uses an overview paragraph plus bullets."],
    S9: ["notIncluded", ""],
    S10: ["notIncluded", ""],
  }),
  skillsSection: { status: "wrongLabel", note: "Labeled \"Skills.\" Computer Science resumes use \"Technical Skills.\"" },
  majorChecklist: checklist(CS_JUNIOR_ITEMS, {
    C1: ["present", "\"Python, Java, SQL\" are listed. Adding Git would match your project work."],
    C2: ["present", "Your Library Management System project counts as a substantial project."],
    C3: ["missing", "\"Worked on the library system\" needs a result. How many books or users did it handle?"],
    C4: ["missing", "Your Library Management System project is a great GitHub starter. Post it and add the link to your header."],
    C5: ["missing", "\"Brooklyn Tech Robotics Team\" is from high school. Replace it with your project or a college club."],
    C7: ["suggest", "Joining ACM or ColorStack at CCNY would add a major-related club."],
    C8: ["suggest", "A hackathon like HackCUNY would fill your Professional Development section."],
  }),
  keywordsFound: ["Python", "Java", "SQL"],
  keywordsToConsider: ["Git", "C++"],
  nextSteps: [
    "Push your Library Management System to GitHub and add the link to your header.",
    "Rewrite \"Worked on the library system\" to start with an action verb and include a number.",
    "Replace \"Brooklyn Tech Robotics Team\" with a college club or your project.",
  ],
  spellingGrammar: [
    { original: "Managment", corrected: "Management" },
    { original: "Java Script", corrected: "JavaScript" },
  ],
};

// ------------------------------------------------------------------
// 3. Biology freshman
//    → everything is a suggestion; no "missing" on the checklist
// ------------------------------------------------------------------
export const MOCK_BIO_FRESHMAN: ResumeCheckResult = {
  isResume: true,
  mode: "SUGGEST",
  summary:
    "Your resume has most of the CPDI structure in place, which is the main goal for freshman year. Adding Relevant Coursework will complete it.",
  strengths: [
    "Your branding statement names research interests in molecular biology, which is specific for a freshman.",
    "Your Hospital Volunteer entry describes your responsibilities clearly.",
  ],
  structure: structure({
    S1: ["present", "Name, City and State, email, phone, and LinkedIn are all in your header."],
    S2: ["present", "\"Biology student interested in molecular biology research\" is a clear start."],
    S3: ["present", "Degree, The City College of New York, and graduation date are listed."],
    S4: ["missing", "Add your intro Biology and Chemistry courses as Relevant Coursework."],
    S5: ["fix", "Your skills heading says \"Skills.\" Biology resumes use \"Lab Skills.\""],
    S6: ["notIncluded", ""],
    S7: ["notIncluded", ""],
    S8: ["present", "Your Hospital Volunteer role uses an overview paragraph plus bullets."],
    S9: ["notIncluded", ""],
    S10: ["notIncluded", ""],
  }),
  skillsSection: { status: "wrongLabel", note: "Labeled \"Skills.\" Biology resumes use \"Lab Skills.\"" },
  majorChecklist: checklist(BIO_FRESHMAN_ITEMS, {
    C1: ["suggest", "Techniques from your BIO 100 lab, like pipetting or microscopy, can start your Lab Skills list."],
    C2: ["suggest", "Ask your BIO 100 professor about research labs that take freshmen."],
    C3: ["suggest", "\"Helped patients\" could say how many patients or which department you supported."],
    C6: ["suggest", "Completing CITI or lab safety training now will help when you apply to research labs."],
    C7: ["suggest", "A biology or pre-health club at CCNY would add an Affiliations section."],
    C8: ["suggest", "A CPDI workshop or a free online lab course would start Professional Development."],
  }),
  keywordsFound: ["microscopy", "patient care"],
  keywordsToConsider: ["pipetting", "lab safety"],
  nextSteps: [
    "Add a Relevant Coursework line with your intro Biology and Chemistry courses.",
    "Rename your \"Skills\" heading to \"Lab Skills\" and list techniques from your BIO 100 lab.",
    "Complete lab safety training so you're ready for research lab openings.",
  ],
  spellingGrammar: [{ original: "recieved", corrected: "received" }],
};

// ------------------------------------------------------------------
// 4. Mechanical Engineering sophomore
//    → suggestion mode, but "No high school content" now appears
//      (as a suggestion) to prepare them for junior year
// ------------------------------------------------------------------
export const MOCK_ME_SOPHOMORE: ResumeCheckResult = {
  isResume: true,
  mode: "SUGGEST",
  summary:
    "Your resume follows the CPDI structure, and your SolidWorks bracket project is a strong start for Mechanical Engineering. A few updates now will set you up well for junior year.",
  strengths: [
    "Your \"Bike Bracket Redesign\" project explains the problem, your CAD process, and the outcome.",
    "Your Technical Skills section is labeled correctly and lists SolidWorks and AutoCAD.",
  ],
  structure: structure({
    S1: ["present", "Name, New York, NY, email, phone, and LinkedIn are all in your header."],
    S2: ["fix", "\"Hardworking engineering student\" could name Mechanical Engineering and the internships you want."],
    S3: ["present", "Degree, The City College of New York, and May 2029 graduation are listed."],
    S4: ["present", "Statics and Engineering Design match entry-level engineering roles."],
    S5: ["present", "Technical Skills, Key Skills, and Languages are included."],
    S6: ["present", "\"Bike Bracket Redesign\" includes the semester and your role."],
    S7: ["notIncluded", ""],
    S8: ["present", "Your Grove School tutoring job uses an overview paragraph plus bullets."],
    S9: ["notIncluded", ""],
    S10: ["notIncluded", ""],
  }),
  skillsSection: { status: "correct", note: "Labeled Technical Skills, which is right for Mechanical Engineering." },
  majorChecklist: checklist(ME_SOPHOMORE_ITEMS, {
    C1: ["present", "\"SolidWorks, AutoCAD\" are in your Technical Skills."],
    C2: ["present", "Your Bike Bracket Redesign counts as a CAD design project."],
    C3: ["suggest", "\"Redesigned the bracket\" could add a result, like the weight you reduced."],
    C5: ["suggest", "\"Stuyvesant Robotics Team\" can stay this year. Plan to replace it with a college project by junior year."],
    C6: ["suggest", "Joining ASME at CCNY would connect you with engineering events and internships."],
    C7: ["suggest", "ASME or Society of Women Engineers would give you an Affiliations section."],
    C8: ["suggest", "A free ANSYS or SolidWorks certification would add Professional Development."],
  }),
  keywordsFound: ["SolidWorks", "AutoCAD", "CAD"],
  keywordsToConsider: ["ANSYS", "3D printing"],
  nextSteps: [
    "Rewrite your branding statement to name Mechanical Engineering and the internships you want.",
    "Add the weight or cost you reduced to your Bike Bracket Redesign bullet.",
    "Apply to the CPDI Internship Program to start building experience for junior year.",
  ],
  spellingGrammar: [],
};

// ------------------------------------------------------------------
// 5. Psychology senior who meets every requirement
//    → should unlock the CPDI Internship Program card
//    (seniors need research or an internship WITH measurable results)
// ------------------------------------------------------------------
export const MOCK_PSY_SENIOR_READY: ResumeCheckResult = {
  isResume: true,
  mode: "REQUIRED",
  summary:
    "Your resume meets every senior requirement for Psychology. Your research assistant role and survey results make you a strong candidate for research and clinical internships.",
  strengths: [
    "\"Recruited and surveyed 120 participants\" shows measurable research impact.",
    "Your Key Skills section leads with SPSS and Qualtrics, the tools psychology labs ask for.",
    "Your Psychology Club treasurer role adds leadership.",
  ],
  structure: structure({
    S1: ["present", "Name, New York, NY, email, phone, and LinkedIn are all in your header."],
    S2: ["present", "\"Psychology senior pursuing clinical research roles\" is clear and specific."],
    S3: ["present", "Degree, The City College of New York, and May 2027 graduation are listed."],
    S4: ["present", "Research Methods and Statistics match research assistant roles."],
    S5: ["present", "Key Skills, Core Qualities, and Languages are included."],
    S6: ["notIncluded", ""],
    S7: ["present", "Your CITI training is listed under Professional Development."],
    S8: ["present", "Your Cognition Lab research assistant role uses an overview paragraph plus bullets."],
    S9: ["present", "Psychology Club is listed with your treasurer role."],
    S10: ["present", "Dean's List is listed with semesters."],
  }),
  skillsSection: { status: "correct", note: "Key Skills comes first, which is right for Psychology." },
  majorChecklist: checklist(PSY_SENIOR_ITEMS, {
    C1: ["present", "\"SPSS, Qualtrics, research methods\" are in your Key Skills."],
    C2: ["present", "Your Cognition Lab role includes \"surveyed 120 participants,\" a measurable result."],
    C3: ["present", "\"Cut data entry time by 30%\" shows a clear outcome."],
    C5: ["present", "No high school content. Your resume is fully college-focused."],
    C6: ["present", "CITI human subjects training is listed."],
    C7: ["present", "Psychology Club treasurer counts as leadership."],
    C8: ["present", "CITI training counts as professional development."],
  }),
  keywordsFound: ["SPSS", "Qualtrics", "research methods", "data analysis"],
  keywordsToConsider: ["R"],
  nextSteps: [
    "Add R to Key Skills if you used it in Statistics, since many labs ask for it.",
    "Tailor your branding statement to each research program you apply to.",
    "Apply to the CPDI Internship Program now that your resume meets the senior checklist.",
  ],
  spellingGrammar: [],
};

// ------------------------------------------------------------------
// 6. Psychology senior with required items still open
//    → research role is there, but without measurable results
// ------------------------------------------------------------------
export const MOCK_PSY_SENIOR_NOT_READY: ResumeCheckResult = {
  ...MOCK_PSY_SENIOR_READY,
  summary:
    "Your Cognition Lab research role is exactly the experience seniors need. Adding results to your bullets and removing high school content will meet the senior requirements.",
  strengths: [
    "Your Cognition Lab research assistant role is strong experience for your major.",
    "Your Key Skills section leads with SPSS and Qualtrics, the tools psychology labs ask for.",
  ],
  structure: MOCK_PSY_SENIOR_READY.structure.map((s) =>
    s.id === "S10"
      ? { ...s, status: "notIncluded" as const, note: "" }
      : s.id === "S9"
        ? { ...s, status: "notIncluded" as const, note: "" }
        : s
  ),
  majorChecklist: checklist(PSY_SENIOR_ITEMS, {
    C1: ["present", "\"SPSS, Qualtrics, research methods\" are in your Key Skills."],
    C2: ["missing", "\"Assisted with lab studies\" needs a result. How many participants or studies did you support?"],
    C3: ["missing", "Your bullets list duties. Start with action verbs and add numbers, like hours or participants."],
    C5: ["missing", "\"Bronx Science Peer Tutor\" is from high school. Replace it with your Cognition Lab work."],
    C6: ["present", "CITI human subjects training is listed."],
    C7: ["suggest", "Running for a Psychology Club officer role would add leadership."],
    C8: ["present", "CITI training counts as professional development."],
  }),
  nextSteps: [
    "Rewrite \"Assisted with lab studies\" to include how many participants or studies you supported.",
    "Replace \"Bronx Science Peer Tutor\" with more detail on your Cognition Lab role.",
    "Ask your lab supervisor what results your work contributed to, then add them as bullets.",
  ],
  spellingGrammar: [{ original: "analyzation", corrected: "analysis" }],
};

// ------------------------------------------------------------------
// Picking a mock while the AI is disconnected
// ------------------------------------------------------------------
// Each class year gets its own mock. For juniors and seniors, flip this
// to test both Internship Program states.
export const UPPER_YEAR_SCENARIO: "ready" | "notReady" = "ready";

export function getMockResult(classYear: string): ResumeCheckResult {
  const ready = UPPER_YEAR_SCENARIO === "ready";
  switch (classYear) {
    case "Senior":
      return ready ? MOCK_PSY_SENIOR_READY : MOCK_PSY_SENIOR_NOT_READY;
    case "Junior":
      return ready ? MOCK_CS_JUNIOR_READY : MOCK_CS_JUNIOR_NOT_READY;
    case "Sophomore":
      return MOCK_ME_SOPHOMORE;
    default:
      return MOCK_BIO_FRESHMAN;
  }
}