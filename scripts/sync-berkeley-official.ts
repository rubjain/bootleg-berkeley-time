import { runBerkeleyOfficialCatalogPipeline } from "@/lib/berkeley-catalog-discovery";
import { berkeleyOfficialSources } from "@/lib/berkeley-official-sources";
import {
  getBerkeleyOfficialCoverage,
  importBerkeleyOfficialDepartments,
  syncBerkeleyOfficialPrograms
} from "@/lib/berkeley-official-sync";

function readNumericFlag(args: string[], flag: string) {
  const match = args.find((arg) => arg.startsWith(`${flag}=`));
  if (!match) return undefined;
  const value = Number(match.split("=")[1]);
  return Number.isFinite(value) ? value : undefined;
}

async function main() {
  const args = process.argv.slice(2);
  const maxCoursePages = readNumericFlag(args, "--course-limit");
  const maxDepartments = readNumericFlag(args, "--department-limit");
  const maxProgramPages = readNumericFlag(args, "--program-limit");
  const skipDepartments = args.includes("--skip-departments");
  const useDiscoveryPipeline = args.includes("--discover");
  const programUrls = args.filter((arg) => !arg.startsWith("--"));

  const onProgress = (message: string) => {
    console.error(`[berkeley-sync] ${message}`);
  };

  if (useDiscoveryPipeline) {
    const pipeline = await runBerkeleyOfficialCatalogPipeline({
      programUrls: programUrls.length ? programUrls : undefined,
      maxDepartments,
      maxProgramPages,
      maxCoursePages,
      syncPrograms: true,
      importCourses: true,
      onProgress
    });
    const coverage = await getBerkeleyOfficialCoverage({ refreshOfficialDepartmentCount: true });
    console.log(JSON.stringify({ pipeline, coverage }, null, 2));
    return;
  }

  const departments = skipDepartments ? undefined : await importBerkeleyOfficialDepartments();
  const programs = await syncBerkeleyOfficialPrograms({
    programUrls: programUrls.length ? programUrls : berkeleyOfficialSources.defaultProgramUrls,
    maxCoursePages,
    onProgress
  });
  const coverage = await getBerkeleyOfficialCoverage({
    refreshOfficialDepartmentCount: true
  });

  console.log(
    JSON.stringify(
      {
        departments,
        programs,
        coverage
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
