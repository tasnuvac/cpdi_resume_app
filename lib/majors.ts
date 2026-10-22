// Single source of truth for the majors and class years the app supports.
// Grouped by CCNY school to match the Miro logic board. The major-specific
// requirements (skills label, keywords, evidence) will be added to each
// entry later, when the AI check is built.

export const UNDECLARED = "Undeclared / Pre-major";

export type MajorGroup = {
  school: string;
  majors: string[];
};

export const MAJOR_GROUPS: MajorGroup[] = [
  {
    school: "Grove School of Engineering",
    majors: [
      "Computer Science",
      "Computer Engineering",
      "Electrical Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Chemical Engineering",
      "Biomedical Engineering",
      "Earth System Science and Environmental Engineering",
    ],
  },
  {
    school: "Division of Science and Sophie Davis",
    majors: [
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
    ],
  },
  {
    school: "Colin Powell School (Social Sciences and Business)",
    majors: [
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
    ],
  },
  {
    school: "Spitzer School of Architecture",
    majors: ["Architecture", "Urban Studies and the Built Environment"],
  },
  {
    school: "Humanities and the Arts: Arts and Media",
    majors: [
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
    ],
  },
  {
    school: "Humanities and the Arts: Humanities and Languages",
    majors: [
      "English",
      "Comparative Literature",
      "History",
      "Philosophy",
      "Black Studies",
      "Romance Languages",
      "Asian Studies",
      "Jewish Studies",
      "Interdisciplinary Arts and Science",
    ],
  },
  {
    school: "School of Education",
    majors: [
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
    ],
  },
];

export const CLASS_YEARS = [
  { value: "Freshman", label: "Freshman (0–29 credits)" },
  { value: "Sophomore", label: "Sophomore (30–59 credits)" },
  { value: "Junior", label: "Junior (60–89 credits)" },
  { value: "Senior", label: "Senior (90+ credits)" },
];
