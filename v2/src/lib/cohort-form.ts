// The cohort inquiry form. It mirrors the "YECC Fresher Trainings - Leads" Google Form question for question
// and posts to it, so every inquiry still lands in that form's responses sheet.
//
// If a question or option is changed in the Google Form, change it here too: option text has to match the
// Google Form exactly, and each entry id comes from the form (Google Forms: open the form, View page source,
// search "entry.").

export const GOOGLE_FORM_ID = "1FAIpQLSeOpj2vDIEViXPIgNYHj70Mny82ozyNJKi6guVa0ma7T-wVFw";
export const GOOGLE_FORM_ACTION = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/formResponse`;

/** Page that hosts the form. Buttons link here with ?cohort=<slug>, which pre-selects that cohort. */
export const COHORT_INQUIRY_PATH = "/cohort-inquiry";
export const cohortInquiry = (slug?: string) => `${COHORT_INQUIRY_PATH}${slug ? `?cohort=${slug}` : ""}#inquiry-form`;

export const ENTRY = {
  firstName: "entry.1484633153",
  lastName: "entry.638411811",
  country: "entry.715100931",
  city: "entry.440907703",
  email: "entry.2034718066",
  whatsapp: "entry.197650773",
  cohort: "entry.1688321968",
  understood: "entry.707405308",
  source: "entry.308193576",
  referredBy: "entry.1047142261",
  qualification: "entry.1723138535",
  stream: "entry.1556204823",
  graduationYear: "entry.1095669699",
  experience: "entry.2121862334",
  company: "entry.2036467774",
  jobTitle: "entry.910162225",
  domain: "entry.1810210728",
  expectation: "entry.1064849419",
  linkedin: "entry.658498754",
} as const;

/** "I am interested to join" options, keyed by the cohort page slug that pre-selects them. `label` is sent to the
 * Google Form and must match it exactly; `short` is what the dropdown shows. */
export const COHORT_OPTIONS = [
  { slug: "oracle-financials", label: "Oracle Cloud Financials (FIN) cohort", short: "Oracle Financials (FIN)" },
  { slug: "oracle-scm", label: "Oracle Cloud Supply Chain Management (SCM) cohort", short: "Oracle Supply Chain (SCM)" },
  { slug: "oracle-hcm", label: "Oracle Cloud Human Capital Management (HCM or HR) cohort", short: "Oracle Human Capital (HCM)" },
];

export const SOURCE_OPTIONS = [
  "Google Search",
  "I got an email from YECC",
  "I found out through Social Media",
  "I got your reference from someone (mention their name in the answer to next question)",
];

export const QUALIFICATION_OPTIONS = ["B.Com", "BBA", "MBA", "CA", "B.Tech", "M.Tech", "M.Com", "Other"];
