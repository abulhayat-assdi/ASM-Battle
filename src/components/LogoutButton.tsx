"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }
  return (
    <button onClick={logout} className="btn-ghost px-3 py-1.5 text-xs">
      Logout
    </button>
  );
}
