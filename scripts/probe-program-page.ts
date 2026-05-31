import { writeFileSync } from "fs";
import { fetchBerkeleyHtml } from "@/lib/berkeley-fetch";

async function main() {
  const html = await fetchBerkeleyHtml("https://undergraduate.catalog.berkeley.edu/programs/A5201U");
  writeFileSync("live-program-page.html", html);

  const scriptMatches = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) ?? [];
  console.log("script tags", scriptMatches.length);

  for (const pattern of ["courseGroupId", "departments", "requisites", "COMPSCI", "application/ld+json", "window.__", "coursedog", "/api/"]) {
    console.log(pattern, html.includes(pattern) ? "YES" : "no");
  }

  const ldJson = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (ldJson) console.log("ld+json", ldJson[1].slice(0, 500));

  const inlineState = html.match(/window\.__[A-Z_]+__\s*=\s*(\{[\s\S]{0,2000})/);
  if (inlineState) console.log("inline state", inlineState[0].slice(0, 500));

  // Search all script contents for JSON-like course data
  for (const script of scriptMatches.slice(0, 30)) {
    if (/course|program|department/i.test(script) && script.length < 50000) {
      console.log("interesting script len", script.length, script.slice(0, 200));
    }
  }
}

main().catch(console.error);
