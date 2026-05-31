import { prisma } from "@/lib/prisma";

async function main() {
  const count = await prisma.course.count();
  const programs = await prisma.program.count();
  const depts = await prisma.department.count();
  console.log(JSON.stringify({ courseCount: count, programCount: programs, departmentCount: depts }, null, 2));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
