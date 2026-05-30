// Phase 1 EXIT GATE — run with: node src/lib/riskEngine.test.mjs
// Proves the three demo scenarios land in their intended tiers EVERY time.
// If any weight in riskConfig.js changes, re-run this.

import { scoreTransaction, applyBehavioral } from "./riskEngine.js";

// A fixed daytime clock so "unusual time" never fires during tests
// (otherwise a test run after 11pm would add 10 points and break scenario A).
const noon = new Date(2026, 4, 29, 12, 0, 0); // 29 May 2026, 12:00

const scenarios = [
  {
    name: "A — Rs.500, normal context",
    input: { amount: 500, payeeId: "9801000001", now: noon },
    expectScore: 0,
    expectTier: "stealth",
  },
  {
    name: "B — Rs.25,000, unusual location",
    input: { amount: 25000, unusualLocation: true, now: noon },
    expectScore: 55, // highValue 30 + unusualLocation 25
    expectTier: "caution",
  },
  {
    name: "C — Rs.50,000, active call + unusual location",
    input: {
      amount: 50000,
      activeCall: true,
      unusualLocation: true,
      now: noon,
    },
    expectScore: 100, // highValue 30 + veryHighValue 15 + activeCall 30 + unusualLocation 25
    expectTier: "intervention",
  },
];

let failures = 0;
const log = (ok, msg) => {
  console.log(`${ok ? "  PASS" : "  FAIL"}  ${msg}`);
  if (!ok) failures++;
};

console.log("\nRisk engine — demo scenario verification\n");
for (const s of scenarios) {
  const r = scoreTransaction(s.input);
  log(
    r.score === s.expectScore && r.tier === s.expectTier,
    `${s.name}  ->  score ${r.score} (want ${s.expectScore}), tier ${r.tier} (want ${s.expectTier})`,
  );
}

// Unusual-time toggle forces the signal even on a daytime clock (+15).
console.log("\nUnusual-time toggle\n");
{
  const r = scoreTransaction({
    amount: 500,
    unusualTime: true,
    now: noon,
  });
  log(
    r.score === 15 && r.firedSignals.some((s) => s.id === "unusualTime"),
    `Toggle on daytime clock  ->  score ${r.score} (want 15), unusualTime fired (${r.firedSignals.some((s) => s.id === "unusualTime")})`,
  );
}

// Behavioral re-escalation: Caution (55) + paste (+20) = 75 -> intervention
console.log("\nBehavioral re-escalation\n");
{
  const base = scoreTransaction({
    amount: 25000,
    unusualLocation: true,
    now: noon,
  });
  const r = applyBehavioral(base, ["paste"]);
  log(
    r.score === 75 && r.tier === "intervention",
    `Caution + paste  ->  score ${r.score} (want 75), tier ${r.tier} (want intervention)`,
  );
}

console.log(
  failures === 0
    ? "\nALL PASS — Phase 1 exit gate met.\n"
    : `\n${failures} FAILURE(S) — do not proceed.\n`,
);
process.exit(failures === 0 ? 0 : 1);
