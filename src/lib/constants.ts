// Central definitions for both forms — keeps the form UI, validation, and
// report generation in sync. Labels preserve the original Bangla/Banglish.

export const ROLES = [
  "Team Captain",
  "Finance Tracker",
  "Reporter",
  "Field Sales Member",
] as const;

export const OBJECTIONS = [
  "দাম বেশি",
  "দরকার নেই",
  "পরে দেখব",
  "অন্য কোথাও সস্তায় পাই",
  "অন্য",
] as const;

export const SALE_OUTCOMES = [
  "হ্যাঁ, কিনেছে",
  "না, কেনেনি",
  "আংশিক — আগ্রহ দেখিয়েছে",
] as const;

export const TEAM_ISSUES = [
  "Communication দুর্বল",
  "কেউ কাজ করছে না",
  "Strategy নিয়ে মতবিরোধ",
  "সব ঠিক আছে",
  "অন্য",
] as const;

export const SELLING_APPROACHES = [
  "Direct approach",
  "Story-based",
  "Problem-solution",
  "Demo",
  "অন্য",
] as const;

export const ATTENDANCE = ["হ্যাঁ", "না"] as const;

export const ADMIN_ROLES = ["SUPER_ADMIN", "MANAGER", "VIEWER"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];
