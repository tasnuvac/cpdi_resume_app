"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useResumeContext } from "../context/ResumeContext";
import MoreServicesButton from "../components/moreServicesButton";
import { MAJOR_GROUPS, CLASS_YEARS, UNDECLARED } from "../../lib/majors";

export default function OptimizePage() {
  const {
    resumeFile,
    setResumeFile,
    major,
    setMajor,
    classYear,
    setClassYear,
    intendedMajor,
    setIntendedMajor,
  } = useResumeContext();

  // The AI check isn't connected yet, so submitting shows a placeholder
  // message instead of going to the loading page. When the AI is built,
  // this is where the rate limiter check and router.push("/loading") return.
  const [showComingSoon, setShowComingSoon] = useState(false);

  const isUndeclared = major === UNDECLARED;
  const canSubmit = Boolean(resumeFile && major && classYear);

  function handleMajorChange(value: string) {
    setMajor(value);
    // Intended major only applies to undeclared students.
    if (value !== UNDECLARED) setIntendedMajor("");
  }

  function handleCheck() {
    if (!canSubmit) return;
    setShowComingSoon(true);
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-6 py-12 md:px-16">
      {/* Top nav row with centered logo */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="justify-self-start">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#EDE7FB] px-5 py-2.5 text-base font-bold text-[#7C5CDB] transition hover:bg-[#D9D2F0]"
          >
            🏠 Home
          </Link>
        </div>
        <div className="justify-self-center">
          <Image
            src="/cpdi-logo.png"
            alt="CCNY Career & Professional Development Institute logo"
            width={340}
            height={101}
            priority
          />
        </div>
        <div className="flex justify-self-end gap-3">
          <MoreServicesButton />
          <a
            href="https://ccny-csm.symplicity.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#EDE7FB] px-5 py-2.5 text-base font-bold text-[#7C5CDB] transition hover:bg-[#D9D2F0]"
          >
            🔗 Career Connections
          </a>
        </div>
      </div>

      <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-[#1A1523] md:text-5xl">
        Resume Readiness Check for Students
      </h1>
      <p className="mt-3 text-lg text-[#5B5468]">
        See whether your resume follows the CPDI structure and has what
        employers expect for your major and class year.
      </p>

      {/* Input cards */}
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {/* Resume upload */}
        <UploadCard
          title="Resume"
          subtitle="Upload your current resume, even a rough draft"
          file={resumeFile}
          onFileSelect={setResumeFile}
          guideLink
        />

        {/* About you */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#1A1523]">About You</h2>
          <p className="mt-1 text-sm text-[#5B5468]">
            So we can check your resume against what your field expects
          </p>

          <SelectField
            id="major"
            label="Major"
            value={major}
            onChange={handleMajorChange}
            placeholder="Select your major"
          >
            <option value={UNDECLARED}>{UNDECLARED}</option>
            {MAJOR_GROUPS.map((group) => (
              <optgroup key={group.school} label={group.school}>
                {group.majors.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </optgroup>
            ))}
          </SelectField>

          {isUndeclared && (
            <SelectField
              id="intendedMajor"
              label="Intended Major (optional)"
              value={intendedMajor}
              onChange={setIntendedMajor}
              placeholder="Not sure yet"
              helpText="We'll add suggestions from this major, but your resume is checked mainly on structure."
            >
              {MAJOR_GROUPS.map((group) => (
                <optgroup key={group.school} label={group.school}>
                  {group.majors.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </optgroup>
              ))}
            </SelectField>
          )}

          <SelectField
            id="classYear"
            label="Class Year"
            value={classYear}
            onChange={setClassYear}
            placeholder="Select your class year"
            helpText="Transfer students: choose based on credits completed."
          >
            {CLASS_YEARS.map((year) => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </SelectField>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-10 flex flex-col items-center gap-3">
        {showComingSoon ? (
          <div className="max-w-md rounded-xl bg-[#FBF0E3] px-5 py-4 text-center">
            <p className="text-sm font-bold text-[#B4711F]">
              Resume feedback is coming soon!
            </p>
            <p className="mt-1 text-sm text-[#5B5468]">
              This tool is still being built. Check back soon to get your
              results.
            </p>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={handleCheck}
              disabled={!canSubmit}
              className="inline-flex items-center gap-2.5 rounded-full bg-[#7C5CDB] px-8 py-4 text-base font-bold text-white transition hover:bg-[#6B4CC7] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Check My Resume
              <span aria-hidden="true">→</span>
            </button>
            {!canSubmit && (
              <p className="text-xs text-[#9B96A8]">
                Upload your resume and choose your major and class year to
                continue.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  placeholder,
  helpText,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  helpText?: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-5">
      <label htmlFor={id} className="text-sm font-bold text-[#1A1523]">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-2 w-full rounded-xl border border-[#EAE6F5] bg-[#FBFAF8] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C5CDB] ${
          value ? "text-[#1A1523]" : "text-[#9B96A8]"
        }`}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      {helpText && <p className="mt-1.5 text-xs text-[#9B96A8]">{helpText}</p>}
    </div>
  );
}

function UploadCard({
  title,
  subtitle,
  file,
  onFileSelect,
  guideLink = false,
}: {
  title: string;
  subtitle: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  guideLink?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(fileList: FileList | null) {
    if (fileList && fileList.length > 0) {
      onFileSelect(fileList[0]);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-[#1A1523]">{title}</h2>
      <p className="mt-1 text-sm text-[#5B5468]">{subtitle}</p>
      {guideLink && (
        <p className="mt-1 text-xs text-[#9B96A8]">
          Need a starting point?{" "}
          <a
            href="/resume-guide.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#7C5CDB] underline hover:text-[#6B4CC7]"
          >
            See the CPDI Resume Guide
          </a>
        </p>
      )}

      {file && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#C9E6D3] bg-[#F1FAF4] px-4 py-3">
          <span className="text-lg">📄</span>
          <span className="flex-1 truncate text-sm font-bold text-[#1A1523]">
            {file.name}
          </span>
          <span
            className="text-base text-[#2F9E5B]"
            role="img"
            aria-label="File accepted"
          >
            ✓
          </span>
          <button
            type="button"
            onClick={() => onFileSelect(null)}
            aria-label={`Remove ${file.name}`}
            className="text-lg leading-none text-[#9B96A8] transition hover:text-[#5B5468]"
          >
            ×
          </button>
        </div>
      )}

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`mt-3 flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition ${
          isDragging
            ? "border-[#7C5CDB] bg-[#F3EFFC]"
            : "border-[#D9D2F0] bg-[#FBFAF8]"
        }`}
      >
        <input
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EDE7FB] text-[#7C5CDB]">
          ↑
        </div>
        <p className="mt-3 text-sm font-bold text-[#1A1523]">
          {file ? "Upload a different file" : "Drag & drop or click to upload"}
        </p>
        {!file && (
          <p className="mt-1 text-xs text-[#9B96A8]">
            PDF or DOCX, up to 5MB
          </p>
        )}
      </label>
    </div>
  );
}