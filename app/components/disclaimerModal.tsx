"use client";

import { useEffect, useState } from "react";

export default function DisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const alreadyAgreed = sessionStorage.getItem("cpdi-disclaimer-agreed");
    if (!alreadyAgreed) {
      setIsOpen(true);
    }
  }, []);

  function handleAgree() {
    sessionStorage.setItem("cpdi-disclaimer-agreed", "true");
    setIsOpen(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-[#1A1523]">
          Before you get started
        </h2>

        <ul className="mt-6 space-y-4 text-left text-base leading-relaxed text-[#5B5468]">
          <li className="flex gap-3">
            <span className="text-[#7C5CDB]">•</span>
            <span>
              This tool gives feedback on a resume you&apos;ve already started — it will not write or rewrite your resume for you.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#7C5CDB]">•</span>
            <span>
              Feedback is based on the CPDI resume structure and what employers commonly look for in your major and class year. It is a starting point, not a replacement for meeting with a CPDI career coach.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#7C5CDB]">•</span>
            <span>
              Formatting like fonts, bolding, and page length can&apos;t be checked from an upload, so you&apos;ll get a short checklist to review those yourself.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#7C5CDB]">•</span>
            <span>
              New to resumes, or is this your first draft? Check out the{" "}
              <a
                href="/resume-guide.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#7C5CDB] underline hover:text-[#6B4CC7]"
              >
                CPDI Resume Guide
              </a>{" "}
              before you start.
            </span>
          </li>
        </ul>

        <button
          type="button"
          onClick={handleAgree}
          className="mt-8 w-full rounded-full bg-[#7C5CDB] px-6 py-4 text-base font-bold text-white transition hover:bg-[#6B4CC7]"
        >
          I Understand, Continue
        </button>
      </div>
    </div>
  );
}