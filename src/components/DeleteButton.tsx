"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({
  type,
  id,
}: {
  type: "individual" | "team";
  id: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function del() {
    if (!confirm("এই রিপোর্টটি মুছে ফেলবেন? এটি ফিরিয়ে আনা যাবে না।")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/reports?type=${type}&id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) router.refresh();
    else {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "মুছতে সমস্যা হয়েছে");
      setBusy(false);
    }
  }

  return (
    <button
      onClick={del}
      disabled={busy}
      className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
    >
      {busy ? "..." : "Delete"}
    </button>
  );
}
