"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Section,
  TextField,
  TextArea,
  RadioGroup,
  CheckboxGroup,
  ScaleField,
} from "@/components/Fields";
import {
  ROLES,
  OBJECTIONS,
  SALE_OUTCOMES,
  TEAM_ISSUES,
} from "@/lib/constants";

export default function IndividualFormPage() {
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
    for (const [key, value] of fd.entries()) {
      if (key === "teamIssues") continue; // handled below
      data[key] = value;
    }
    data.teamIssues = fd.getAll("teamIssues");

    try {
      const res = await fetch("/api/reports/individual", {
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
          রিপোর্ট জমা হয়েছে!
        </h1>
        <p className="mt-2 text-slate-500">
          ধন্যবাদ। আপনার আজকের রিপোর্ট সফলভাবে সংরক্ষিত হয়েছে।
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
          Individual Daily Report
        </h1>
        <p className="text-sm text-slate-500">
          আজকের আপনার ব্যক্তিগত রিপোর্ট পূরণ করুন। <span className="text-rose-500">*</span> চিহ্নিত প্রশ্ন আবশ্যক।
        </p>
      </header>

      {status === "error" && (
        <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <Section title="১ — Basic Info">
          <TextField name="name" label="নামঃ" required />
          <TextField name="teamName" label="টীমের নামঃ" required />
          <TextField name="date" label="তারিখঃ" type="date" required />
          <RadioGroup
            name="role"
            label="আজকে আপনার Role কী ছিল?"
            options={ROLES}
            required
          />
        </Section>

        <Section title="২ — Numbers">
          <TextField
            name="approached"
            label="আজকে আপনি কতজনকে approach করেছেন?"
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
            name="salesAmount"
            label="আপনার personal sales amount আজকে? (৳)"
            type="number"
            min={0}
            required
          />
          <TextField
            name="profit"
            label="আপনার personal profit আজকে? (৳)"
            type="number"
            required
          />
        </Section>

        <Section title="৩ — Learning">
          <TextArea
            name="bestPitch"
            label="আজকের সেরা pitch কোনটা ছিল?"
            required
          />
          <RadioGroup
            name="hardestObjection"
            label="আজকে সবচেয়ে কঠিন objection কী ছিল?"
            options={OBJECTIONS}
            required
          />
          <TextArea
            name="objectionHandled"
            label="সেই objection আপনি কীভাবে handle করেছেন?"
            required
          />
          <RadioGroup
            name="saleOutcome"
            label="Objection handle করার পর শেষ পর্যন্ত সেলস সম্পন্ন হয়েছে কি?"
            options={SALE_OUTCOMES}
            required
          />
        </Section>

        <Section title="৪ — Reflection">
          <ScaleField
            name="selfRating"
            label="আজকে নিজেকে কত দেবেন? (০–১০)"
            required
          />
          <TextArea
            name="biggestMistake"
            label="আজকে সবচেয়ে বড় ভুল কী করেছেন?"
            required
          />
          <TextArea
            name="tomorrowChange"
            label="আগামীকাল একটা জিনিস differently করবেন সেটা কী?"
            required
          />
        </Section>

        <Section title="৫ — Team Pulse">
          <TextField
            name="teamBestWork"
            label="আজকে team-এর সবচেয়ে ভালো কাজ কী ছিল?"
          />
          <CheckboxGroup
            name="teamIssues"
            label="Team-এর কোথায় সমস্যা হচ্ছে?"
            options={TEAM_ISSUES}
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
