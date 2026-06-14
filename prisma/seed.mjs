// Seeds the initial super-admin from env vars. Safe to run multiple times.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME || "admin";
  const password = process.env.SEED_ADMIN_PASSWORD || "admin123";
  const name = process.env.SEED_ADMIN_NAME || "Super Admin";

  const hash = await bcrypt.hash(password, 10);

  const admin = await prisma.adminUser.upsert({
    where: { username },
    update: {},
    create: { username, name, password: hash, role: "SUPER_ADMIN" },
  });

  console.log(`✅ Admin ready: ${admin.username} (role: ${admin.role})`);
  console.log(`   Login with username "${username}" and the password from your .env.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
