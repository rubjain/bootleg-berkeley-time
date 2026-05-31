import { writeFileSync } from "fs";
import { fetchBerkeleyHtml } from "@/lib/berkeley-fetch";
import { extractBerkeleyCatalogCoursePageIds } from "@/lib/berkeley-importer";

async function main() {
  for (let page = 1; page <= 3; page += 1) {
    const url = `https://undergraduate.catalog.berkeley.edu/courses?cq=&sortBy=code&page=${page}`;
    const html = await fetchBerkeleyHtml(url);
    const ids = extractBerkeleyCatalogCoursePageIds(html);
    const courseLinks = html.match(/\/courses\/[a-zA-Z0-9]+/g) ?? [];
    const codes = html.match(/\b[A-Z][A-Z& ]{1,10}\s*\d+[A-Z]?\b/g) ?? [];
    console.log("page", page, "len", html.length, "ids", ids.length, "links", [...new Set(courseLinks)].length, "codes sample", [...new Set(codes)].slice(0, 8));
    if (page === 1) writeFileSync("catalog-courses-page1.html", html.slice(0, 50000));
  }
}

main().catch(console.error);
