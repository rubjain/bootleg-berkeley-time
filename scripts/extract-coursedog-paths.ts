import { writeFileSync } from "fs";

async function main() {
  const js = await fetch("https://static.catalog.prod.coursedog.com/f0c575f/_nuxt/B1MGhuvT.js").then((r) => r.text());
  writeFileSync("coursedog-bundle.js", js);

  const needles = ["courses", "programs", "departments", "catalogs", "courseGroup", "peoplesoft", "ucberkeley"];
  for (const needle of needles) {
    let idx = 0;
    let count = 0;
    while ((idx = js.indexOf(needle, idx)) !== -1 && count < 5) {
      console.log(needle, js.slice(Math.max(0, idx - 60), idx + 80).replace(/\s+/g, " "));
      idx += needle.length;
      count += 1;
    }
  }
}

main().catch(console.error);
