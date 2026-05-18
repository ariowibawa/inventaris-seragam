import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client.js";
import { hash } from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 Seeding database...");

  // ============ Admin User ============
  const hashedPassword = await hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@uniform.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@uniform.com",
      password: hashedPassword,
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // ============ Settings ============
  const settings = [
    { key: "default_minimum_stock", value: "15" },
  ];
  for (const data of settings) {
    await prisma.setting.upsert({
      where: { key: data.key },
      update: {},
      create: data,
    });
  }
  console.log(`✅ ${settings.length} settings created`);

  console.log("\n🎉 Seeding completed successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Login credentials:");
  console.log("  Email: admin@uniform.com");
  console.log("  Password: admin123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
