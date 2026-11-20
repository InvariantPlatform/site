#!/usr/bin/env node
// Writes content/register-shape.json: the decision register's SHAPE (category
// names and counts, no titles) from the private index, which only the
// operator's machine has. The site's decision total is the sum of these
// counts, so the graphic and the number can never disagree again (bug-231).
//
//   node scripts/register-shape.mjs ../../adr_index.md          preview
//   node scripts/register-shape.mjs ../../adr_index.md --write  write the file
import { readFileSync, writeFileSync } from "node:fs";

const [index, flag] = process.argv.slice(2);
if (!index || index === "--help" || index === "-h") {
  console.log("usage: register-shape.mjs <path to adr_index.md> [--write]");
  process.exit(index ? 0 : 2);
}
const shape = [];
let current = null;
for (const line of readFileSync(index, "utf8").split("\n")) {
  const head = line.match(/^## (.+)$/);
  if (head) {
    current = { name: head[1].trim(), n: 0 };
    shape.push(current);
  } else if (current && /^- \*\*ADR-\d{3}\*\*/.test(line)) {
    current.n += 1;
  }
}
const categories = shape.filter((c) => c.n > 0);
const total = categories.reduce((a, c) => a + c.n, 0);
const out = `${JSON.stringify(categories, null, 2)}\n`;
for (const c of categories) console.log(`${String(c.n).padStart(4)}  ${c.name}`);
console.log(`${String(total).padStart(4)}  decisions`);
if (flag === "--write") {
  writeFileSync(new URL("../content/register-shape.json", import.meta.url), out);
  console.log("wrote content/register-shape.json");
} else {
  console.log("preview only; --write to write content/register-shape.json");
}
