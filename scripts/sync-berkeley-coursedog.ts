import { runBerkeleyCoursedogFullImport } from "@/lib/berkeley-coursedog-import";
import { getBerkeleyOfficialCoverage } from "@/lib/berkeley-official-sync";

async function main() {
  const onProgress = (message: string) => {
    console.error(`[berkeley-coursedog] ${message}`);
  };

  const result = await runBerkeleyCoursedogFullImport({ onProgress });
  const coverage = await getBerkeleyOfficialCoverage({ refreshOfficialDepartmentCount: true });
  console.log(JSON.stringify({ result, coverage }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
