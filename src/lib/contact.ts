// The central Contact page and the topics every call to action can open it with.
//
// A button links to contact("eutaas-standard"), which opens /book-a-discussion/?topic=eutaas-standard.
// The form then selects that topic's "How can YECC help?" option and fills in its starter message,
// so the visitor can submit straight away or edit first. The selected option is sent as the email
// subject line.

export const CONTACT_PATH = "/book-a-discussion";
export const CONTACT_ANCHOR = "contact-form";

/**
 * Where the form posts its JSON. Left empty until the email service is built; while it is empty the
 * form falls back to opening the visitor's email app with everything filled in.
 *
 * Payload (POST, Content-Type: application/json):
 *   { subject, name, company, email, role, message, topic, page }
 * subject is the "How can YECC help?" option and is meant to become the email subject line.
 * Respond with any 2xx status on success.
 */
export const CONTACT_ENDPOINT = "";

/** The "How can YECC help?" options, in the order they appear. Each has a starter message. */
export const OPTIONS = [
  { label: "SI partnership with YECC", message: "We are an Oracle SI and would like to explore a partnership with YECC for user enablement on our client projects. Please get in touch to set up a discussion." },
  { label: "End User Training (EUTaaS)", message: "We would like to discuss outsourcing End User Training for an Oracle Cloud client engagement. Please get in touch to scope it." },
  { label: "Documentation-as-a-Service (DOCaaS)", message: "We would like to discuss client-specific user guides and process videos for an Oracle Cloud engagement. Please get in touch to scope it." },
  { label: "Oracle resource augmentation", message: "We need experienced Oracle consultants for a project. Please get in touch so we can share the module, role and start date." },
  { label: "Consultant training batch", message: "We would like to discuss an Oracle Fusion training batch for our consultants. Please get in touch so we can share the track, batch size and start date." },
  { label: "SHERPA pilot", message: "We would like to discuss a complimentary SHERPA executive pilot for one of our Oracle Cloud clients. Please get in touch to set it up." },
  { label: "Individual training cohort", message: "I would like to register for an upcoming Oracle training cohort. Please share the next steps." },
  { label: "General enquiry", message: "I would like to know more about how YECC can help. Please get in touch." },
] as const;

type Label = (typeof OPTIONS)[number]["label"];

/** Topics a link can open the form with: the option to select, and a more specific message where the button is specific. */
export const TOPICS: Record<string, { option: Label; message?: string }> = {
  partnership: { option: "SI partnership with YECC" },
  eutaas: { option: "End User Training (EUTaaS)" },
  "eutaas-orientation": { option: "End User Training (EUTaaS)", message: "We would like to discuss a Pre-Implementation Orientation for our client’s key users, before HLA and CRP. Please get in touch to scope it." },
  "eutaas-standard": { option: "End User Training (EUTaaS)", message: "We would like to discuss Standard End User Training for our client’s end users, between UAT sign-off and go-live. Please get in touch to scope it." },
  "eutaas-refresher": { option: "End User Training (EUTaaS)", message: "We would like to discuss Refresher EUT for our client’s existing users and new joiners after go-live. Please get in touch to scope it." },
  docaas: { option: "Documentation-as-a-Service (DOCaaS)" },
  // Old name, kept so links made before the rename still pre-select DOCaaS.
  daas: { option: "Documentation-as-a-Service (DOCaaS)" },
  resources: { option: "Oracle resource augmentation" },
  training: { option: "Consultant training batch" },
  "training-fresher": { option: "Consultant training batch", message: "We would like to discuss a Fresher Consultant Batch for our new campus hires. Please get in touch so we can share the track, batch size and start date." },
  "training-upskilling": { option: "Consultant training batch", message: "We would like to discuss a Lateral Upskilling and Cross-skilling batch for our existing consultants. Please get in touch so we can share the modules, batch size and start date." },
  "training-rampup": { option: "Consultant training batch", message: "We would like to discuss a Project Ramp-up Batch to prepare a team before a project or support start. Please get in touch so we can share the client processes, team size and start date." },
  sherpa: { option: "SHERPA pilot" },
  cohort: { option: "Individual training cohort" },
  general: { option: "General enquiry" },
};

export type Topic = keyof typeof TOPICS;

/** Link to the Contact page, opened on a topic. */
export const contact = (topic: Topic = "general") => `${CONTACT_PATH}?topic=${topic}#${CONTACT_ANCHOR}`;
