// Tiny validation helpers — no external dep. Throws ValidationError on failure.

export class ValidationError extends Error {}

type Raw = Record<string, unknown>;

export function str(data: Raw, key: string, required = true): string {
  const v = data[key];
  if (v === undefined || v === null || String(v).trim() === "") {
    if (required) throw new ValidationError(`"${key}" আবশ্যক`);
    return "";
  }
  return String(v).trim();
}

export function optStr(data: Raw, key: string): string | null {
  const v = str(data, key, false);
  return v === "" ? null : v;
}

export function num(data: Raw, key: string, required = true): number {
  const v = data[key];
  if (v === undefined || v === null || String(v).trim() === "") {
    if (required) throw new ValidationError(`"${key}" আবশ্যক`);
    return 0;
  }
  const n = Number(v);
  if (Number.isNaN(n)) throw new ValidationError(`"${key}" একটি সংখ্যা হতে হবে`);
  return n;
}

export function optNum(data: Raw, key: string): number | null {
  const v = data[key];
  if (v === undefined || v === null || String(v).trim() === "") return null;
  const n = Number(v);
  if (Number.isNaN(n)) throw new ValidationError(`"${key}" একটি সংখ্যা হতে হবে`);
  return n;
}

export function date(data: Raw, key: string): Date {
  const v = str(data, key);
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) throw new ValidationError(`"${key}" সঠিক তারিখ নয়`);
  return d;
}

export function strArray(data: Raw, key: string): string[] {
  const v = data[key];
  if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean);
  if (v === undefined || v === null || v === "") return [];
  return [String(v)];
}
