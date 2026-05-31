const SCHOOL = "ucberkeley_peoplesoft";
const BASE = "https://app.coursedog.com/api/v1";
const headers = {
  "User-Agent": "CourseMap-Berkeley-Official-Sync/0.3",
  Accept: "application/json",
  "X-Requested-With": "catalog",
  Origin: "https://undergraduate.catalog.berkeley.edu",
  Referer: "https://undergraduate.catalog.berkeley.edu/"
};

async function main() {
  let skip = 0;
  const limit = 200;
  let total = 0;
  while (skip < 20000) {
    const response = await fetch(`${BASE}/cm/${SCHOOL}/courses?limit=${limit}&skip=${skip}&sortBy=code`, {
      headers,
      cache: "no-store"
    });
    const data = (await response.json()) as Record<string, unknown>;
    const count = Object.keys(data).length;
    total += count;
    console.log("skip", skip, "batch", count, "total", total);
    if (count === 0) break;
    skip += limit;
  }

  let pskip = 0;
  let ptotal = 0;
  while (pskip < 5000) {
    const response = await fetch(`${BASE}/cm/${SCHOOL}/programs?limit=${limit}&skip=${pskip}`, {
      headers,
      cache: "no-store"
    });
    const data = (await response.json()) as Record<string, unknown>;
    const count = Object.keys(data).length;
    ptotal += count;
    console.log("programs skip", pskip, "batch", count, "total", ptotal);
    if (count === 0) break;
    pskip += limit;
  }
}

main().catch(console.error);
