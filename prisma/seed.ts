import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo data...");

  const demoSociety = await prisma.society.upsert({
    where: { joinCode: "GREEN123" },
    update: {},
    create: {
      name: "Green Valley Heights",
      joinCode: "GREEN123",
      address: "123, Demo Lane, Tech Park",
      city: "Pune",
      pincode: "411001",
      totalFlats: 10,
    },
  });

  console.log(`Demo society created/found: ${demoSociety.name} (Code: ${demoSociety.joinCode})`);

  const demoFlats = [
    { flatNumber: "101", wing: "A", floor: 1 },
    { flatNumber: "102", wing: "A", floor: 1 },
    { flatNumber: "201", wing: "B", floor: 2 },
    { flatNumber: "202", wing: "B", floor: 2 },
    { flatNumber: "301", wing: "C", floor: 3 },
  ];

  for (const flat of demoFlats) {
    await prisma.flat.upsert({
      where: {
        societyId_flatNumber: {
          societyId: demoSociety.id,
          flatNumber: flat.flatNumber,
        },
      },
      update: {},
      create: {
        societyId: demoSociety.id,
        flatNumber: flat.flatNumber,
        wing: flat.wing,
        floor: flat.floor,
        flatType: "2BHK",
        currentOccupant: "vacant",
      },
    });
  }

  console.log(`Created ${demoFlats.length} demo flats.`);
  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
