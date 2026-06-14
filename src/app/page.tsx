import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-12">
      <div className="mb-10 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-600">
          Team Battle
        </p>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          দৈনিক রিপোর্ট সিস্টেম
        </h1>
        <p className="mt-3 text-slate-500">
          নিচ থেকে আপনার রিপোর্টের ধরন বেছে নিন এবং আজকের তথ্য জমা দিন।
        </p>
      </div>

      <div className="grid w-full gap-5 sm:grid-cols-2">
        <Link
          href="/report/individual"
          className="card group p-6 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">
            🧍
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            Individual Report
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            প্রতিটি member নিজের আজকের কাজের রিপোর্ট দেবে।
          </p>
          <span className="mt-4 inline-block text-sm font-semibold text-brand-600 group-hover:underline">
            ফর্ম পূরণ করুন →
          </span>
        </Link>

        <Link
          href="/report/team"
          className="card group p-6 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">
            👥
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Team Report</h2>
          <p className="mt-1 text-sm text-slate-500">
            প্রতিটি team-এর পক্ষ থেকে একটি দৈনিক রিপোর্ট।
          </p>
          <span className="mt-4 inline-block text-sm font-semibold text-brand-600 group-hover:underline">
            ফর্ম পূরণ করুন →
          </span>
        </Link>
      </div>

      <Link
        href="/admin"
        className="mt-10 text-sm text-slate-400 transition hover:text-slate-600"
      >
        🔒 Admin Panel
      </Link>
    </main>
  );
}
