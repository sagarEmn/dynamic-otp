// Known eSewa IDs — mirrors the "Recent" payee avatars in the real UI.
// Anything NOT on this list is treated as a first-time / new payee.
// (Future`: persist in localStorage so payees become "known" after first payment.)
export const KNOWN_PAYEES = [
  "9801000001", // Person1
  "9802000002", // Person2
  "9803000003", // Person3
  "9804000004", // Person4
];

export function isKnownPayee(esewaId) {
  return KNOWN_PAYEES.includes((esewaId || "").trim());
}
