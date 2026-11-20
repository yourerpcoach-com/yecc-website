// Oracle Fusion module chips and target audience per pillar. Shared by the Consulting Training track cards (For SIs)
// and the cohort tiles on the consultants page, so both always list the same modules.
export const MODULES = {
  fin: ["Common Basics", "General Ledger", "Payables", "Receivables", "Fixed Assets", "Cash Management", "Common Advanced"],
  scm: ["Common Basics", "SCM Basics", "SSP", "Purchasing", "Sourcing", "SQM", "Inventory", "PDH", "Order Management"],
  hcm: ["Common Basics", "Core HR", "Absence", "Talent", "Recruitment", "Compensation", "Benefits", "Learn"],
} as const;

/** Who each pillar suits best. Shown as "Most suitable for" on the cohort tiles and "Suits" on the SI track cards. */
export const SUITABLE = {
  fin: "CA, CMA, MBA in Finance, Accounting or Finance Domain Experts",
  scm: "MBA in Operations, Marketing or similar, Industrial Engineers, Supply Chain Domain Experts",
  hcm: "MBA in HR, Engineers with Programming Experience, HR Domain Experts",
} as const;
