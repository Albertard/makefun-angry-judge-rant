// make.fun — "Angry Judge: The Short Rant Contest"
// Bounty: u-riidzhsn-angry-judge-the-short-rant-contest-b9f46046
//
// Writes one short, funny rant about an everyday annoyance to
// /output/entry.txt. The rant: my microwave beeps when it is done,
// then beeps again every minute forever, like it is filing a noise
// complaint against my lunch — and it even beeps to confirm I pressed
// stop. The joke lands on the last line: it is the only appliance in
// the house that demands applause for heating soup. Specific,
// concrete, and a fresher target than the usual broken printer.
//
// Node 22, standard library only. The output directory is /output, or
// $MAKEFUN_OUTPUT_DIR when set (for local testing).

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TEXT =
  "My microwave beeps when it is done, then beeps again every minute, forever, like it is filing a noise complaint against my lunch. I press stop, it beeps to confirm I pressed stop. I open the door, it beeps because the door is open. It is the only appliance in my house that demands applause for heating soup.";

// The gate: 1-400 Unicode code points, and not only white space. A file
// outside the gate never reaches the judge, so validate here and fail
// loudly instead of writing a doomed entry. Array.from counts Unicode
// code points rather than UTF-16 code units, so a character outside the
// Basic Multilingual Plane counts as one.
const GATE_MIN = 1;
const GATE_MAX = 400;

function validateLength(candidate: string): number {
  const length = Array.from(candidate).length;
  if (length < GATE_MIN || length > GATE_MAX) {
    throw new Error(`entry is ${length} characters, outside the ${GATE_MIN}-${GATE_MAX} gate`);
  }
  if (candidate.trim().length === 0) {
    throw new Error("entry holds only white space");
  }
  return length;
}

function validateSingleLine(candidate: string): void {
  if (candidate.includes("\n")) {
    throw new Error("entry must be a single line");
  }
}

// Control characters (other than tab, which a rant has no use for
// either) would survive the length gate but could garble the judge's
// reading of the text, so reject them outright.
function validateNoControlChars(candidate: string): void {
  for (const ch of candidate) {
    const code = ch.codePointAt(0) as number;
    if (code < 0x20 || code === 0x7f) {
      throw new Error(`entry contains a control character U+${code.toString(16).padStart(4, "0")}`);
    }
  }
}

const length = validateLength(TEXT);
validateSingleLine(TEXT);
validateNoControlChars(TEXT);
console.log(`entry OK: ${length} characters`);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outPath = join(outDir, "entry.txt");

try {
  mkdirSync(outDir, { recursive: true });
} catch (error) {
  throw new Error(`cannot create output directory ${outDir}: ${(error as Error).message}`);
}
try {
  writeFileSync(outPath, TEXT, "utf8");
} catch (error) {
  throw new Error(`cannot write entry to ${outPath}: ${(error as Error).message}`);
}
