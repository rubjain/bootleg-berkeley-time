import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import {
  extractBerkeleyCatalogCoursePageIds,
  extractBerkeleyCatalogProgramPageUrls
} from "@/lib/berkeley-importer";

const fixtureRoot = join(process.cwd());

function readFixture(name: string) {
  return readFileSync(join(fixtureRoot, name), "utf8");
}

describe("berkeley-importer", () => {
  it("extracts course page ids from embedded catalog links", () => {
    const html = `
      courseGroupId:"COMPSCI61A"
      https://undergraduate.catalog.berkeley.edu/courses/DATAC100
      "/courses/MATH54AB"
    `;
    const ids = extractBerkeleyCatalogCoursePageIds(html);
    expect(ids).toEqual(["COMPSCI61A", "DATAC100", "MATH54AB"].sort((a, b) => a.localeCompare(b)));
  });

  it("extracts course page ids from offline eleng fixture when present", () => {
    const html = readFixture("berkeley-dept-eleng-courses.html");
    const ids = extractBerkeleyCatalogCoursePageIds(html);
    expect(Array.isArray(ids)).toBe(true);
  });

  it("extracts program page urls from embedded catalog links", () => {
    const html = `
      https://undergraduate.catalog.berkeley.edu/programs/16I011U
      "/programs/16306U"
    `;
    const urls = extractBerkeleyCatalogProgramPageUrls(html);
    expect(urls).toEqual([
      "https://undergraduate.catalog.berkeley.edu/programs/16306U",
      "https://undergraduate.catalog.berkeley.edu/programs/16I011U"
    ]);
  });

  it("loads berkeley programs fixture for offline integration checks", () => {
    const html = readFixture("berkeley-programs.html");
    expect(html.includes("Programs")).toBe(true);
    expect(extractBerkeleyCatalogProgramPageUrls(html)).toBeInstanceOf(Array);
  });
});
