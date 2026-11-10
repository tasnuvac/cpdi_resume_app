"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { ResumeCheckResult } from "../../lib/resumePrompt";

// Shared, in-memory state for the student's inputs and their results so
// they persist while navigating between pages. Nothing is stored on a
// server or in a database; refreshing the page clears it.

type ResumeContextType = {
  result: ResumeCheckResult | null;
  setResult: (result: ResumeCheckResult | null) => void;
  resumeFile: File | null;
  setResumeFile: (file: File | null) => void;
  major: string;
  setMajor: (value: string) => void;
  classYear: string;
  setClassYear: (value: string) => void;
  intendedMajor: string;
  setIntendedMajor: (value: string) => void;
};

const ResumeContext = createContext<ResumeContextType | null>(null);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [major, setMajor] = useState("");
  const [classYear, setClassYear] = useState("");
  const [intendedMajor, setIntendedMajor] = useState("");
  const [result, setResult] = useState<ResumeCheckResult | null>(null);

  return (
    <ResumeContext.Provider
      value={{
        result,
        setResult,
        resumeFile,
        setResumeFile,
        major,
        setMajor,
        classYear,
        setClassYear,
        intendedMajor,
        setIntendedMajor,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResumeContext() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error("useResumeContext must be used inside a ResumeProvider");
  }
  return context;
}