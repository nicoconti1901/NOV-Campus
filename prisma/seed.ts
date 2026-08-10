import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ROOMS } from "../src/lib/capacitacion/constants";

const prisma = new PrismaClient();

async function main() {
  for (const room of ROOMS) {
    await prisma.room.upsert({
      where: { slug: room.slug },
      update: { name: room.name },
      create: room,
    });
  }

  const email = process.env.ADMIN_EMAIL ?? "admin@casinoclub.com";
  const password = process.env.ADMIN_PASSWORD ?? "Admin123!";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log("Seed completado. Salas y administrador inicializados.");
  console.log(`Admin: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
