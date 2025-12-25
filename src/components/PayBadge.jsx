import React from "react";

export default function PayBadge({ label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 px-3 py-1 text-xs">
      <span className="size-4 rounded bg-slate-200 dark:bg-slate-700" />
      {label}
    </span>
  );
}


