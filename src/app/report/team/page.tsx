"use client";

import { useState } from "react";
import Link from "next/link";
import { Section, TextField, TextArea, RadioGroup } from "@/components/Fields";
import {
  ATTENDANCE,
  SELLING_APPROACHES,
  OBJECTIONS,
} from "@/lib/constants";

export default function TeamFormPage() {
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    setError("");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const data: Record<string, unknown> = {};
    for (const [key, value] of fd.entries()) data[key] = value;

    try {
      const res = await fetch("/api/reports/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submit failed");
      setStatus("done");
      form.reset();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "কিছু একটা সমস্যা হয়েছে");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 text-5xl">✅</div>
        <h1 className="text-2xl font-bold text-slate-900">
          Team রিপোর্ট জমা হয়েছে!
        </h1>
        <p className="mt-2 text-slate-500">
          ধন্যবাদ। আজকের team রিপোর্ট সফলভাবে সংরক্ষিত হয়েছে।
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={() => setStatus("idle")} className="btn-primary">
            আরেকটি জমা দিন
          </button>
          <Link href="/" className="btn-ghost">
            হোম
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-6">
        <Link href="/" className="text-sm text-slate-400 hover:text-slate-600">
          ← হোম
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Team Daily Report
        </h1>
        <p className="text-sm text-slate-500">
          প্রতিটি team-এর পক্ষ থেকে একটি রিপোর্ট। <span className="text-rose-500">*</span> চিহ্নিত প্রশ্ন আবশ্যক।
        </p>
      </header>

      {status === "error" && (
        <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <Section title="Basic">
          <TextField name="teamName" label="Team নাম" required />
          <TextField name="date" label="আজকের তারিখ" type="date" required />
          <TextField name="captain" label="আজকের Team Captain কে?" required />
          <RadioGroup
            name="allPresent"
            label="Team-এর সবাই উপস্থিত ছিল?"
            options={ATTENDANCE}
            required
          />
          <TextField
            name="whoAbsent"
            label="যদি না হয়, তবে কে ছিল না?"
          />
        </Section>

        <Section title="Numbers">
          <TextField
            name="approached"
            label="আজকে team মোট কতজনকে approach করেছে?"
            type="number"
            min={0}
            required
          />
          <TextField
            name="purchased"
            label="কতজন কিনেছে?"
            type="number"
            min={0}
            required
          />
          <TextField
            name="conversion"
            label="Team-এর conversion rate আজকে?"
            placeholder="যেমন: 25% (ঐচ্ছিক)"
          />
          <TextField
            name="totalSales"
            label="আজকে team-এর মোট sales? (৳)"
            type="number"
            min={0}
            required
          />
          <TextField
            name="totalProfit"
            label="আজকে team-এর মোট profit? (৳)"
            type="number"
            required
          />
          <TextField
            name="cumulativeProfit"
            label="Cumulative total profit এখন পর্যন্ত? (৳)"
            type="number"
          />
        </Section>

        <Section title="People">
          <TextField
            name="topPerformer"
            label="আজকে team-এর সেরা performer কে?"
            required
          />
          <TextField
            name="mostStruggled"
            label="আজকে কে সবচেয়ে বেশি struggle করেছে?"
            required
          />
        </Section>

        <Section title="Strategy & Learning">
          <RadioGroup
            name="bestApproach"
            label="আজকে কোন selling approach সবচেয়ে ভালো কাজ করেছে?"
            options={SELLING_APPROACHES}
            required
          />
          <TextField
            name="bestArea"
            label="আজকে কোন area/location-এ বিক্রি সবচেয়ে ভালো হয়েছে?"
            required
          />
          <RadioGroup
            name="commonObjection"
            label="আজকে সবচেয়ে common objection কোনটা ছিল?"
            options={OBJECTIONS}
            required
          />
          <TextArea
            name="objectionHandled"
            label="এই objection team কীভাবে handle করেছে?"
            required
          />
          <TextArea
            name="tomorrowStrategy"
            label="আগামীকালের জন্য team-এর strategy কী?"
            required
          />
          <TextField
            name="memberHelp"
            label="কোনো team member-এর জন্য আলাদা help দরকার?"
            placeholder="না / বিস্তারিত লিখুন (ঐচ্ছিক)"
          />
        </Section>

        <button
          type="submit"
          disabled={status === "saving"}
          className="btn-primary w-full"
        >
          {status === "saving" ? "জমা হচ্ছে..." : "রিপোর্ট জমা দিন"}
        </button>
      </form>
    </main>
  );
}
