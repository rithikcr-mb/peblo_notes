import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const passwordHash = await hash("password123", 12);

  await prisma.user.upsert({
    where: { email: "demo@peblo.app" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@peblo.app",
      passwordHash,
      notes: {
        create: [
          {
            title: "Launch checklist",
            category: "Product",
            content:
              "# Launch checklist\n\n- Finalize README\n- Record demo walkthrough\n- Verify sharing flow\n- Deploy on Vercel\n\n## Notes\n\nKeep the reviewer journey simple and memorable.",
            tags: { create: [{ name: "launch" }, { name: "review" }] },
          },
          {
            title: "Meeting notes",
            category: "Work",
            content:
              "# Meeting notes\n\nDiscussed AI summaries, public note sharing, and weekly writing analytics.\n\nAction items should be visible without leaving the editor.",
            tags: { create: [{ name: "meeting" }, { name: "ai" }] },
          },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
