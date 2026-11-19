"use client";

import { useSyncExternalStore } from "react";
import { decodeProgress, readLastCode } from "../../lib/progressCode";

// Optional "Checked before?" field on the upload page. Shows right away
// whether the pasted code is valid, and offers the code saved on this
// device (if any) so returning students don't need to paste it.

// Reads the saved code in a way that's safe during server rendering
// (where there's no browser storage) and doesn't flash or mismatch.
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export default function ProgressCodeField({ value, onChange }: {
  value: string;
  onChange: (value: string) => void;
}) {
  const savedCode = useSyncExternalStore(subscribe, readLastCode, () => null);

  const trimmed = value.trim();
  const decoded = trimmed ? decodeProgress(trimmed) : null;

  return (
    <div className="mt-5">
      <label htmlFor="progressCodeIn" className="text-sm font-bold text-[#1A1523]">
        Checked before? Paste your progress code (optional)
      </label>
      <input
        id="progressCodeIn"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="RC-XXXXX-XXXXX-XXXXX"
        autoComplete="off"
        spellCheck={false}
        className="mt-2 w-full rounded-xl border border-[#EAE6F5] bg-[#FBFAF8] p-3 font-mono text-sm text-[#1A1523] focus:outline-none focus:ring-2 focus:ring-[#7C5CDB]"
      />

      {trimmed && decoded && (
        <p className="mt-1.5 text-xs font-bold text-[#2F9E5B]">
          ✓ Found your check from{" "}
          {decoded.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} (
          {decoded.classYear}, {decoded.major}). We&apos;ll show what improved.
        </p>
      )}
      {trimmed && !decoded && (
        <p className="mt-1.5 text-xs font-bold text-[#B4711F]">
          That code doesn&apos;t look right. Check for typos, or leave this blank.
        </p>
      )}
      {!trimmed && savedCode && (
        <button
          type="button"
          onClick={() => onChange(savedCode)}
          className="mt-1.5 text-xs font-bold text-[#7C5CDB] underline hover:text-[#6B4CC7]"
        >
          Use the code saved on this device
        </button>
      )}
      {!trimmed && !savedCode && (
        <p className="mt-1.5 text-xs text-[#9B96A8]">
          You&apos;ll get a code on your results page to see your progress next time.
        </p>
      )}
    </div>
  );
}