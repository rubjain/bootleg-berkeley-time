import { runBerkeleyOfficialCatalogPipeline } from "@/lib/berkeley-catalog-discovery";
import { berkeleyOfficialSources } from "@/lib/berkeley-official-sources";
import {
  getBerkeleyOfficialCoverage,
  importBerkeleyOfficialDepartments,
  syncBerkeleyOfficialPrograms
} from "@/lib/berkeley-official-sync";
import { syncInstructorRmpRatings } from "@/lib/rmp/sync-to-db";

function readNumericFlag(args: string[], flag: string) {
  const match = args.find((arg) => arg.startsWith(`${flag}=`));
  if (!match) return undefined;
  const value = Number(match.split("=")[1]);
  return Number.isFinite(value) ? value : undefined;
}

function readStringFlag(args: string[], flag: string) {
  const match = args.find((arg) => arg.startsWith(`${flag}=`));
  return match ? match.split("=")[1] : undefined;
}

async function main() {
  const args = process.argv.slice(2);
  const full = args.includes("--full");
  const maxCoursePages = full ? undefined : readNumericFlag(args, "--course-limit");
  const maxDepartments = full ? undefined : readNumericFlag(args, "--department-limit");
  const maxProgramPages = full ? undefined : readNumericFlag(args, "--program-limit");
  const skipDepartments = args.includes("--skip-departments");
  const useDiscoveryPipeline = args.includes("--discover");
  const skipRmp = args.includes("--skip-rmp");
  const resumeRunId = readStringFlag(args, "--resume-run-id");
  const courseChunkSize = readNumericFlag(args, "--course-chunk");
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
      courseChunkSize,
      full,
      resumeRunId,
      createSyncRun: full || Boolean(resumeRunId),
      syncPrograms: true,
      importCourses: true,
      syncInstructors: true,
      syncRmp: !skipRmp,
      onProgress
    });

    let rmpSync;
    if (!skipRmp) {
      onProgress("Syncing instructor RMP ratings...");
      rmpSync = await syncInstructorRmpRatings({ limit: full ? 500 : 100 });
    }

    const coverage = await getBerkeleyOfficialCoverage({ refreshOfficialDepartmentCount: true });
    console.log(JSON.stringify({ pipeline, rmpSync, coverage }, null, 2));
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
