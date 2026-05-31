import { writeFileSync } from "fs";

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": "CourseMap-Berkeley-Official-Sync/0.3" },
    cache: "no-store"
  });
  return { status: response.status, text: await response.text() };
}

async function main() {
  const { text: coursesHtml } = await fetchText("https://guide.berkeley.edu/courses/");
  console.log("courses page length", coursesHtml.length);
  console.log("course links", (coursesHtml.match(/\/courses\/[a-z0-9-]+\//gi) ?? []).length);
  console.log("sample links", [...new Set(coursesHtml.match(/\/courses\/[a-z0-9-]+\//gi) ?? [])].slice(0, 10));

  const apiHints = coursesHtml.match(/https:\/\/[^"'\\s]+/g) ?? [];
  const filtered = [...new Set(apiHints.filter((u) => /guide|catalog|search|api|course/i.test(u)))].slice(0, 40);
  console.log("api hints", filtered);

  const { text: searchHtml } = await fetchText(
    "https://guide.berkeley.edu/search/?P=COMPSCI%2061A"
  );
  console.log("search page course codes", (searchHtml.match(/COMPSCI\s*61A/gi) ?? []).length);

  writeFileSync("guide-courses-snippet.html", coursesHtml.slice(0, 15000));
}

main().catch(console.error);
