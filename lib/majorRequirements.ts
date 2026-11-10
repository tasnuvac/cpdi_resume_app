// What the resume check looks for in each major, taken from the Miro
// logic board. Server-only: imported by the API route, never by a page,
// so this data isn't shipped to students' browsers.
//
// Only the ONE entry for the student's major is sent to Gemini on each
// check. Sending all 63 every time would roughly triple the input tokens.
//
// Keys must match the major names in lib/majors.ts exactly.

export type MajorRequirement = {
  skillsLabel: "Technical Skills" | "Lab Skills" | "Key Skills first";
  lookFor: string;
  evidence: string;
  extra?: string; // certifications, societies, header links, notes
  githubRequiredFromJunior?: boolean;
};

const TEACHER_CERTS = "NYS teacher certification exams by senior year";

export const MAJOR_REQUIREMENTS: Record<string, MajorRequirement> = {
  // Grove School of Engineering
  "Computer Science": {
    skillsLabel: "Technical Skills",
    lookFor: "Python, Java, C++, SQL, Git",
    evidence: "projects with a GitHub repo",
    githubRequiredFromJunior: true,
  },
  "Computer Engineering": {
    skillsLabel: "Technical Skills",
    lookFor: "C, C++, Verilog, MATLAB",
    evidence: "embedded or FPGA build",
    githubRequiredFromJunior: true,
  },
  "Electrical Engineering": {
    skillsLabel: "Technical Skills",
    lookFor: "MATLAB, LTspice, PCB design",
    evidence: "circuit or PCB build",
    extra: "Society: IEEE",
  },
  "Mechanical Engineering": {
    skillsLabel: "Technical Skills",
    lookFor: "SolidWorks, AutoCAD, ANSYS",
    evidence: "CAD or design project",
    extra: "Society: ASME",
  },
  "Civil Engineering": {
    skillsLabel: "Technical Skills",
    lookFor: "AutoCAD, Civil 3D, Revit",
    evidence: "structure or transportation project",
    extra: "Certs: OSHA 10, FE exam by senior year",
  },
  "Chemical Engineering": {
    skillsLabel: "Lab Skills",
    lookFor: "Aspen Plus, HPLC, titration",
    evidence: "unit operations or process design",
    extra: "Society: AIChE",
  },
  "Biomedical Engineering": {
    skillsLabel: "Lab Skills",
    lookFor: "cell culture, MATLAB, SolidWorks",
    evidence: "device prototype or research lab",
    extra: "Society: BMES",
  },
  "Earth System Science and Environmental Engineering": {
    skillsLabel: "Technical Skills",
    lookFor: "ArcGIS, Python, R",
    evidence: "field study or GIS project",
    extra: "A Lab Skills section is a suggestion only",
  },

  // Division of Science and Sophie Davis
  Biology: {
    skillsLabel: "Lab Skills",
    lookFor: "PCR, gel electrophoresis, cell culture",
    evidence: "research lab or REU",
    extra: "Certs: CITI or lab safety",
  },
  Biotechnology: {
    skillsLabel: "Lab Skills",
    lookFor: "PCR, cell culture, aseptic technique, bioprocessing",
    evidence: "biotech or research lab",
    extra: "Certs: CITI or lab safety",
  },
  "Biology for Allied Health Professions": {
    skillsLabel: "Lab Skills",
    lookFor: "anatomy and physiology lab, patient care basics",
    evidence: "clinical volunteering, healthcare setting",
    extra: "Certs: CPR/BLS",
  },
  "Science Learning and Public Engagement": {
    skillsLabel: "Key Skills first",
    lookFor: "science communication, outreach, lesson design",
    evidence: "museum education, tutoring, outreach programs",
  },
  Chemistry: {
    skillsLabel: "Lab Skills",
    lookFor: "HPLC, NMR, titration, ChemDraw",
    evidence: "research or analytical lab",
    extra: "Certs: lab safety training",
  },
  Biochemistry: {
    skillsLabel: "Lab Skills",
    lookFor: "Western blot, SDS-PAGE, ELISA",
    evidence: "research lab or biotech internship",
    extra: "Certs: CITI or lab safety",
  },
  Physics: {
    skillsLabel: "Lab Skills",
    lookFor: "optics, Python, MATLAB, LabVIEW",
    evidence: "research lab or REU",
  },
  "Earth and Atmospheric Sciences": {
    skillsLabel: "Lab Skills",
    lookFor: "field sampling, ArcGIS, Python",
    evidence: "field research",
  },
  "Environmental Earth System Science": {
    skillsLabel: "Lab Skills",
    lookFor: "water sampling, GIS, remote sensing",
    evidence: "research or environmental internship",
  },
  Mathematics: {
    skillsLabel: "Technical Skills",
    lookFor: "Python, R, MATLAB, LaTeX",
    evidence: "data project, research, or tutoring",
  },
  "Biomedical Science (BS/MD)": {
    skillsLabel: "Lab Skills",
    lookFor: "lab techniques, patient care",
    evidence: "clinical volunteering, research",
    extra: "Certs: CPR/BLS, CITI",
  },

  // Colin Powell School (Social Sciences and Business)
  Anthropology: {
    skillsLabel: "Key Skills first",
    lookFor: "ethnographic research, interviewing, NVivo",
    evidence: "fieldwork or museum internship",
  },
  "Strategic Management (BBA)": {
    skillsLabel: "Key Skills first",
    lookFor: "strategic planning, data analysis, Excel, project management",
    evidence: "business internship, case competition",
  },
  "Entrepreneurship (BBA)": {
    skillsLabel: "Key Skills first",
    lookFor: "business planning, market research, Excel, pitching",
    evidence: "startup or venture project, pitch competition",
  },
  "Management and Administration": {
    skillsLabel: "Key Skills first",
    lookFor: "Excel, project management, market research",
    evidence: "business internship, case competition",
  },
  Economics: {
    skillsLabel: "Technical Skills",
    lookFor: "Excel, Stata, R or Python",
    evidence: "data or research project",
  },
  "Finance (BBA)": {
    skillsLabel: "Technical Skills",
    lookFor: "financial modeling, Excel, Bloomberg Terminal",
    evidence: "finance internship, investment club",
  },
  "International Studies": {
    skillsLabel: "Key Skills first",
    lookFor: "policy research, languages with proficiency level",
    evidence: "study abroad, NGO internship",
  },
  "Latin American and Latino Studies": {
    skillsLabel: "Key Skills first",
    lookFor: "bilingual communication, community research",
    evidence: "community organization work",
  },
  "Political Science": {
    skillsLabel: "Key Skills first",
    lookFor: "policy analysis, legislative research, writing",
    evidence: "government or campaign internship",
  },
  Psychology: {
    skillsLabel: "Key Skills first",
    lookFor: "research methods, SPSS, R, Qualtrics",
    evidence: "research lab assistant",
    extra: "Certs: CITI human subjects",
  },
  Sociology: {
    skillsLabel: "Key Skills first",
    lookFor: "survey design, qualitative interviewing, SPSS",
    evidence: "research or nonprofit internship",
  },

  // Spitzer School of Architecture
  Architecture: {
    skillsLabel: "Technical Skills",
    lookFor: "Rhino, Revit, AutoCAD, model making",
    evidence: "studio projects, firm internship",
    extra: "Header: portfolio link",
  },
  "Urban Studies and the Built Environment": {
    skillsLabel: "Key Skills first",
    lookFor: "ArcGIS, urban planning, community research, policy analysis",
    evidence: "planning agency or community organization internship",
  },

  // Humanities and the Arts: Arts and Media
  Art: {
    skillsLabel: "Technical Skills",
    lookFor: "Photoshop, Illustrator, InDesign, Lightroom",
    evidence: "exhibitions, gallery internship",
    extra: "Header: portfolio link",
  },
  "Electronic Design and Multimedia": {
    skillsLabel: "Technical Skills",
    lookFor: "Figma, After Effects, Adobe Creative Cloud",
    evidence: "design projects",
    extra: "Header: portfolio link",
  },
  "Advertising and Public Relations": {
    skillsLabel: "Key Skills first",
    lookFor: "copywriting, social media, Google Analytics, Canva",
    evidence: "agency internship, campaigns",
  },
  "Film and Video Production": {
    skillsLabel: "Technical Skills",
    lookFor: "Premiere Pro, DaVinci Resolve, camera and lighting",
    evidence: "film credits",
    extra: "Header: reel link",
  },
  "Popular Music Studies": {
    skillsLabel: "Technical Skills",
    lookFor: "Logic Pro, Ableton, songwriting, music business",
    evidence: "performances, releases, music industry internship",
  },
  "Sonic Arts: Audio Production": {
    skillsLabel: "Technical Skills",
    lookFor: "Pro Tools, Ableton, mixing, mastering",
    evidence: "studio or live sound credits",
  },
  Theatre: {
    skillsLabel: "Key Skills first",
    lookFor: "acting, directing, stage management, QLab",
    evidence: "productions with role and year",
  },
  Journalism: {
    skillsLabel: "Key Skills first",
    lookFor: "AP Style, reporting, interviewing, CMS, multimedia storytelling",
    evidence: "published clips, student newspaper, newsroom internship",
    extra: "Header: clips or portfolio link",
  },
  "Jazz Studies (Vocal)": {
    skillsLabel: "Key Skills first",
    lookFor: "jazz repertoire, improvisation, sight reading",
    evidence: "performances, ensembles, recitals, teaching",
  },
  "Jazz Studies (Instrumental)": {
    skillsLabel: "Key Skills first",
    lookFor: "instrument, jazz repertoire, improvisation, sight reading",
    evidence: "performances, ensembles, recitals, teaching",
  },

  // Humanities and the Arts: Humanities and Languages
  English: {
    skillsLabel: "Key Skills first",
    lookFor: "writing, editing, research, WordPress or CMS",
    evidence: "publications, editorial internship",
  },
  "Comparative Literature": {
    skillsLabel: "Key Skills first",
    lookFor: "translation, literary analysis, languages with proficiency",
    evidence: "translation or writing projects",
  },
  History: {
    skillsLabel: "Key Skills first",
    lookFor: "archival research, primary sources, Zotero",
    evidence: "museum or archive internship",
  },
  Philosophy: {
    skillsLabel: "Key Skills first",
    lookFor: "logical reasoning, ethics, argumentation",
    evidence: "ethics bowl, debate, law or policy internship",
  },
  "Black Studies": {
    skillsLabel: "Key Skills first",
    lookFor: "community research, policy analysis, writing",
    evidence: "nonprofit or community work",
  },
  "Romance Languages": {
    skillsLabel: "Key Skills first",
    lookFor: "translation, interpretation, languages with proficiency",
    evidence: "tutoring, study abroad",
  },
  "Asian Studies": {
    skillsLabel: "Key Skills first",
    lookFor: "regional research, languages with proficiency",
    evidence: "study abroad, cultural organization",
  },
  "Jewish Studies": {
    skillsLabel: "Key Skills first",
    lookFor: "historical research, Hebrew or Yiddish with proficiency",
    evidence: "museum or community work",
  },
  "Interdisciplinary Arts and Science": {
    skillsLabel: "Key Skills first",
    lookFor: "research, writing, skills from the student's chosen focus",
    evidence: "projects tied to their focus, work experience",
  },

  // School of Education
  "Art Teacher (All Grades)": {
    skillsLabel: "Key Skills first",
    lookFor: "lesson planning, classroom management, studio art, Adobe Creative Cloud",
    evidence: "tutoring, student teaching, after-school art programs",
    extra: `Certs: ${TEACHER_CERTS}`,
  },
  "English Teacher (Grades 7-12)": {
    skillsLabel: "Key Skills first",
    lookFor: "lesson planning, classroom management, literacy instruction, writing",
    evidence: "tutoring, student teaching, writing center",
    extra: `Certs: ${TEACHER_CERTS}`,
  },
  "Mathematics Teacher (Grades 7-12)": {
    skillsLabel: "Key Skills first",
    lookFor: "lesson planning, classroom management, Desmos, GeoGebra",
    evidence: "math tutoring, student teaching",
    extra: `Certs: ${TEACHER_CERTS}`,
  },
  "Social Studies Teacher (Grades 7-12)": {
    skillsLabel: "Key Skills first",
    lookFor: "lesson planning, classroom management, history, civics",
    evidence: "tutoring, student teaching, after-school programs",
    extra: `Certs: ${TEACHER_CERTS}`,
  },
  "Spanish Teacher (Grades 7-12)": {
    skillsLabel: "Key Skills first",
    lookFor: "lesson planning, classroom management, Spanish with proficiency level",
    evidence: "language tutoring, student teaching",
    extra: `Certs: ${TEACHER_CERTS}`,
  },
  "Biology Teacher (Grades 7-12)": {
    skillsLabel: "Key Skills first",
    lookFor: "lesson planning, classroom management, lab instruction, lab safety",
    evidence: "science tutoring, student teaching",
    extra: `Certs: ${TEACHER_CERTS}`,
  },
  "Chemistry Teacher (Grades 7-12)": {
    skillsLabel: "Key Skills first",
    lookFor: "lesson planning, classroom management, lab instruction, lab safety",
    evidence: "science tutoring, student teaching",
    extra: `Certs: ${TEACHER_CERTS}`,
  },
  "Earth Science Teacher (Grades 7-12)": {
    skillsLabel: "Key Skills first",
    lookFor: "lesson planning, classroom management, field and lab instruction",
    evidence: "science tutoring, student teaching",
    extra: `Certs: ${TEACHER_CERTS}`,
  },
  "Physics Teacher (Grades 7-12)": {
    skillsLabel: "Key Skills first",
    lookFor: "lesson planning, classroom management, lab demonstrations",
    evidence: "science or math tutoring, student teaching",
    extra: `Certs: ${TEACHER_CERTS}`,
  },
  "Childhood Education": {
    skillsLabel: "Key Skills first",
    lookFor: "lesson planning, classroom management, literacy and math instruction",
    evidence: "tutoring, classroom aide, after-school or camp programs",
    extra: `Certs: ${TEACHER_CERTS}`,
  },
  "Bilingual Childhood Education (Grades 1-6)": {
    skillsLabel: "Key Skills first",
    lookFor: "bilingual instruction, lesson planning, languages with proficiency level",
    evidence: "bilingual tutoring, classroom aide, student teaching",
    extra: "Certs: NYS teacher certification exams, including the bilingual assessment",
  },
  "Early Childhood Education": {
    skillsLabel: "Key Skills first",
    lookFor: "child development, play-based learning, classroom management",
    evidence: "daycare or preschool experience, classroom aide",
    extra: `Certs: CPR/First Aid, ${TEACHER_CERTS}`,
  },
};