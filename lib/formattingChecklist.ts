// CPDI formatting rules the AI can't check, because text pulled from an
// upload doesn't show fonts, bolding, or page length. The results page
// shows this list as-is for students to check themselves.
//
// Kept out of resumePrompt.ts on purpose: that file imports the major
// requirements, which should stay on the server. This file is safe to
// import from any page.
export const FORMATTING_SELF_CHECK = [
  "Times New Roman or Arial",
  "Font size 10.5 to 12",
  "Fits on one page",
  "Name in bold capital letters",
  "Position titles in bold italics",
  "Organization names in bold",
];