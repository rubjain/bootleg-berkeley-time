import { fetchBerkeleyHtml } from "@/lib/berkeley-fetch";
import { readFileSync, writeFileSync } from "fs";

async function main() {
  const liveUrls = [
    "https://undergraduate.catalog.berkeley.edu/programs/A5201U",
    "https://undergraduate.catalog.berkeley.edu/courses/25975U",
    "https://undergraduate.catalog.berkeley.edu/departments/COMPSCI/programs"
  ];

  for (const url of liveUrls) {
    try {
      const html = await fetchBerkeleyHtml(url);
      console.log(url, "len", html.length, "nuxt empty", html.includes("__NUXT__={}"), "data[0]", html.includes("data:[{"));
    } catch (error) {
      console.log(url, "ERR", error instanceof Error ? error.message : error);
    }
  }

  const fixture = readFileSync("berkeley-dept-compsci-courses.html", "utf8");
  console.log("fixture courseGroupId", (fixture.match(/courseGroupId/gi) ?? []).length);

  const programsHtml = await fetchBerkeleyHtml("https://undergraduate.catalog.berkeley.edu/programs");
  const apiHints = programsHtml.match(/https:\/\/[^"'\\s]+/g) ?? [];
  const coursedog = [...new Set(apiHints.filter((u) => u.includes("coursedog") || u.includes("catalog")))].slice(0, 30);
  console.log("coursedog urls", coursedog);
  writeFileSync("catalog-api-hints.txt", coursedog.join("\n"));
}

main().catch(console.error);
