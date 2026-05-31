const headers = {
  "User-Agent": "CourseMap-Berkeley-Official-Sync/0.3",
  Accept: "application/json",
  "X-Requested-With": "catalog",
  Origin: "https://undergraduate.catalog.berkeley.edu",
  Referer: "https://undergraduate.catalog.berkeley.edu/"
};

async function get(url: string) {
  const response = await fetch(url, { headers, cache: "no-store" });
  const text = await response.text();
  console.log(response.status, url);
  console.log(text.slice(0, 600));
  console.log("---");
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function main() {
  const catalog = await get(
    "https://app.coursedog.com/api/v1/catalogs/urls?url=https://undergraduate.catalog.berkeley.edu"
  );
  if (!catalog || typeof catalog !== "object") return;

  const catalogId = (catalog as { catalog?: { id?: string }; catalogId?: string }).catalog?.id ??
    (catalog as { catalogId?: string }).catalogId;
  const school = (catalog as { school?: string | { id?: string } }).school;
  const schoolId = typeof school === "string" ? school : school?.id;
  console.log("catalogId", catalogId, "schoolId", schoolId);

  if (catalogId) {
    await get(`https://app.coursedog.com/api/v1/cm/catalogs/${catalogId}/courses?limit=5&page=1`);
    await get(`https://app.coursedog.com/api/v1/cm/catalogs/${catalogId}/programs?limit=5&page=1`);
    await get(`https://app.coursedog.com/api/v1/cm/catalogs/${catalogId}/departments?limit=5&page=1`);
  }

  if (schoolId) {
    await get(`https://app.coursedog.com/api/v1/cm/${schoolId}/courses?limit=5&page=1`);
    await get(`https://app.coursedog.com/api/v1/cm/${schoolId}/programs?limit=5&page=1`);
    await get(`https://app.coursedog.com/api/v1/cm/${schoolId}/departments?limit=5&page=1`);
  }
}

main().catch(console.error);
