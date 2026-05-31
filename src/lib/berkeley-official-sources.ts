export const berkeleyOfficialSources = {
  catalogIndex: "https://undergraduate.catalog.berkeley.edu/",
  classSearch: "https://classes.berkeley.edu/",
  programsIndex: "https://undergraduate.catalog.berkeley.edu/programs",
  defaultProgramUrls: [
    "https://undergraduate.catalog.berkeley.edu/programs/A5201U",
    "https://undergraduate.catalog.berkeley.edu/programs/A50AMU",
    "https://undergraduate.catalog.berkeley.edu/programs/70141U",
    "https://undergraduate.catalog.berkeley.edu/programs/25975U",
    "https://undergraduate.catalog.berkeley.edu/programs/A5I172U",
    "https://undergraduate.catalog.berkeley.edu/programs/25I071U",
    "https://undergraduate.catalog.berkeley.edu/programs/16I011U",
    "https://undergraduate.catalog.berkeley.edu/programs/25540U",
    "https://undergraduate.catalog.berkeley.edu/programs/25780U",
    "https://undergraduate.catalog.berkeley.edu/programs/16306U",
    "https://undergraduate.catalog.berkeley.edu/programs/25594U",
    "https://undergraduate.catalog.berkeley.edu/programs/25063U",
    "https://undergraduate.catalog.berkeley.edu/programs/25101U",
    "https://undergraduate.catalog.berkeley.edu/programs/25675U",
    "https://undergraduate.catalog.berkeley.edu/programs/25775U",
    "https://undergraduate.catalog.berkeley.edu/programs/25175U"
  ],
  notes: [
    "Use the UC Berkeley Undergraduate Catalog as the official catalog source for approved undergraduate course definitions and program requirements.",
    "Use classes.berkeley.edu as the official schedule/offering source for term-specific sections and enrollment state.",
    "As of April 23, 2026, Berkeley's current official undergraduate catalog is on undergraduate.catalog.berkeley.edu rather than the older guide.berkeley.edu transition site.",
    "Projected future offerings must remain labeled as projections unless backed by the official Class Search.",
    "The public catalog homepage exposes the full department list in embedded page state. Department /courses pages embed courseGroupId values in Nuxt payloads and are the primary automated discovery path for official course page ids.",
    "Program requirement rules reference alphanumeric course page ids (not only numeric). Sync and discovery treat both shapes as valid /courses/{id} URLs."
  ]
};

export type BerkeleyCourseImportJob = {
  sourceType: "catalog" | "schedule";
  sourceUrl: string;
  status: "planned" | "ready_for_fetch" | "review_required";
  notes: string;
};

export function getBerkeleyImportPlan(): BerkeleyCourseImportJob[] {
  return [
    {
      sourceType: "catalog",
      sourceUrl: berkeleyOfficialSources.catalogIndex,
      status: "ready_for_fetch",
      notes: "Fetch the official Berkeley undergraduate catalog and linked course/program pages to normalize the complete approved course inventory and source-backed requirement pages."
    },
    {
      sourceType: "schedule",
      sourceUrl: berkeleyOfficialSources.classSearch,
      status: "review_required",
      notes: "Fetch term-by-term section listings from Berkeley's official class search to load offerings, meeting patterns, and enrollment status."
    }
  ];
}
