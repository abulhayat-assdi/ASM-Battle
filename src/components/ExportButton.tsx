"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ExportButton() {
  const params = useSearchParams();
  const [busy, setBusy] = useState(false);

  async function exportDoc() {
    setBusy(true);
    try {
      const qs = params.toString();
      const res = await fetch(`/api/admin/export${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const stamp = new Date().toISOString().slice(0, 10);
      a.download = `team-battle-report-${stamp}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("রিপোর্ট তৈরিতে সমস্যা হয়েছে।");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={exportDoc} disabled={busy} className="btn-primary">
      {busy ? "তৈরি হচ্ছে..." : "⬇️ Word (.docx) ডাউনলোড"}
    </button>
  );
}
