import { resolveRequirementImporter } from "@/lib/importers/requirements/registry";

export function previewRequirementImport(input: { sourceUrl: string; html?: string }) {
  const importer = resolveRequirementImporter(input.sourceUrl);

  if (!importer) {
    return {
      status: "NO_IMPORTER",
      message: "No matching importer found. Route this source through manual review.",
      sourceUrl: input.sourceUrl
    };
  }

  return {
    status: "PREVIEW_READY",
    importer: importer.label,
    parsed: importer.parse({
      sourceUrl: input.sourceUrl,
      html: input.html ?? ""
    })
  };
}
