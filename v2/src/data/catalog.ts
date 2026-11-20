import courses from "./courses.json";

// Short catalog blurbs in catalog order. Everything else, including the filter tags, comes from courses.json.
export const catalog = [
  { slug: "erp-business-processes-overview", text: "Start your ERP consulting journey with an overview of essential business processes." },
  { slug: "basics-of-erp-2024", text: "A beginner-friendly introduction to ERP, its functional areas, and consulting foundations." },
  { slug: "oracle-cloud-p2p-fast-track-course", text: "Covers Oracle Cloud ERP common concepts, General Accounting, Payables, Procurement basics, and Cash Management." },
  { slug: "oracle-cloud-expense", text: "Training on Oracle Cloud Expense module processes and setups." },
  { slug: "oracle-cloud-scm-process-course", text: "Training on Oracle Cloud SCM processes, excluding setups." },
  { slug: "oracle-cloud-erp-basics-and-general-accounting-2025-26", text: "Key concepts in Oracle Cloud ERP common topics and General Accounting." },
  { slug: "oracle-cloud-erp-accounts-payable-2025-26", text: "Fundamentals of Oracle Cloud Accounts Payable and P2P concepts from the Payables side." },
  { slug: "oracle-cloud-erp-cash-management-2025-26", text: "Fundamentals of the Oracle Cloud Cash Management module." },
  { slug: "oracle-cloud-erp-accounts-receivable-2025-26", text: "Fundamentals of the Oracle Cloud Accounts Receivable module." },
  { slug: "oracle-cloud-erp-fixed-assets-2025-26", text: "Fundamentals of the Oracle Cloud Fixed Assets module." },
].map((item) => ({ ...item, course: courses.find((c) => c.slug === item.slug)! }));
