"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set(key, value);
    else sp.delete(key);
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="field-label">From</label>
        <input
          type="date"
          defaultValue={params.get("from") || ""}
          onChange={(e) => update("from", e.target.value)}
          className="field-input"
        />
      </div>
      <div>
        <label className="field-label">To</label>
        <input
          type="date"
          defaultValue={params.get("to") || ""}
          onChange={(e) => update("to", e.target.value)}
          className="field-input"
        />
      </div>
      {(params.get("from") || params.get("to")) && (
        <button
          onClick={() => router.push(pathname)}
          className="btn-ghost py-2.5 text-sm"
        >
          Clear
        </button>
      )}
    </div>
  );
}
