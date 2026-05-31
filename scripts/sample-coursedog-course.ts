import { writeFileSync } from "fs";

const headers = {
  "User-Agent": "CourseMap-Berkeley-Official-Sync/0.3",
  Accept: "application/json",
  "X-Requested-With": "catalog",
  Origin: "https://undergraduate.catalog.berkeley.edu",
  Referer: "https://undergraduate.catalog.berkeley.edu/"
};

async function main() {
  const response = await fetch(
    "https://app.coursedog.com/api/v1/cm/ucberkeley_peoplesoft/courses?limit=3&skip=1000&sortBy=code",
    { headers }
  );
  const data = await response.json();
  writeFileSync("coursedog-course-sample.json", JSON.stringify(data, null, 2));
  console.log("written sample");
}

main().catch(console.error);
