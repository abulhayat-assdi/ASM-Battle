import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseRange } from "@/lib/range";
import { getSession, canManage } from "@/lib/auth";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

const taka = (n: number) => "৳" + n.toLocaleString("en-IN");
const fmtDate = (d: Date) => new Date(d).toISOString().slice(0, 10);

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; tab?: string };
}) {
  const range = parseRange(searchParams);
  const tab = searchParams.tab === "team" ? "team" : "individual";
  const session = await getSession();
  const manage = session ? canManage(session.role) : false;

  const where =
    range.from || range.to
      ? { date: { ...(range.from && { gte: range.from }), ...(range.to && { lte: range.to }) } }
      : {};

  const [individuals, teams] = await Promise.all([
    prisma.individualReport.findMany({ where, orderBy: { date: "desc" }, take: 500 }),
    prisma.teamReport.findMany({ where, orderBy: { date: "desc" }, take: 500 }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Submissions</h1>
        <p className="text-sm text-slate-500">
          সব জমা পড়া রিপোর্ট দেখুন{manage ? " ও মুছুন" : ""}।
        </p>
      </div>

      <div className="flex gap-2">
        <TabLink active={tab === "individual"} href="?tab=individual">
          Individual ({individuals.length})
        </TabLink>
        <TabLink active={tab === "team"} href="?tab=team">
          Team ({teams.length})
        </TabLink>
      </div>

      {tab === "individual" ? (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <Th>Date</Th>
                <Th>Name</Th>
                <Th>Team</Th>
                <Th>Role</Th>
                <Th>Appr.</Th>
                <Th>Purch.</Th>
                <Th>Sales</Th>
                <Th>Profit</Th>
                <Th>Rating</Th>
                <Th>Objection</Th>
                {manage && <Th>—</Th>}
              </tr>
            </thead>
            <tbody>
              {individuals.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 align-top">
                  <Td>{fmtDate(r.date)}</Td>
                  <Td className="font-medium text-slate-900">{r.name}</Td>
                  <Td>{r.teamName}</Td>
                  <Td>{r.role}</Td>
                  <Td>{r.approached}</Td>
                  <Td>{r.purchased}</Td>
                  <Td>{taka(r.salesAmount)}</Td>
                  <Td className="font-semibold text-brand-700">{taka(r.profit)}</Td>
                  <Td>{r.selfRating}/10</Td>
                  <Td className="max-w-[160px] truncate">{r.hardestObjection}</Td>
                  {manage && (
                    <Td>
                      <DeleteButton type="individual" id={r.id} />
                    </Td>
                  )}
                </tr>
              ))}
              {individuals.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-slate-400">
                    কোনো রিপোর্ট নেই।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <Th>Date</Th>
                <Th>Team</Th>
                <Th>Captain</Th>
                <Th>Present</Th>
                <Th>Appr.</Th>
                <Th>Purch.</Th>
                <Th>Sales</Th>
                <Th>Profit</Th>
                <Th>Top</Th>
                <Th>Approach</Th>
                {manage && <Th>—</Th>}
              </tr>
            </thead>
            <tbody>
              {teams.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 align-top">
                  <Td>{fmtDate(r.date)}</Td>
                  <Td className="font-medium text-slate-900">{r.teamName}</Td>
                  <Td>{r.captain}</Td>
                  <Td>{r.allPresent}</Td>
                  <Td>{r.approached}</Td>
                  <Td>{r.purchased}</Td>
                  <Td>{taka(r.totalSales)}</Td>
                  <Td className="font-semibold text-brand-700">{taka(r.totalProfit)}</Td>
                  <Td>{r.topPerformer}</Td>
                  <Td>{r.bestApproach}</Td>
                  {manage && (
                    <Td>
                      <DeleteButton type="team" id={r.id} />
                    </Td>
                  )}
                </tr>
              ))}
              {teams.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-slate-400">
                    কোনো রিপোর্ট নেই।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TabLink({
  active,
  href,
  children,
}: {
  active: boolean;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-brand-600 text-white"
          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </Link>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-2.5 font-semibold">{children}</th>;
}
function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`whitespace-nowrap px-4 py-2.5 ${className}`}>{children}</td>;
}
