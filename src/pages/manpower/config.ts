export type RoleOption = { id: string; label: string; enabled?: boolean };
export type RoleFields = Record<string, string | string[]>;

export type FieldConfig = {
  key: string;
  label: string;
  type: "select" | "input" | "textarea" | "multi";
  options?: string[];
  placeholder?: string;
  required?: boolean;
};

export const defaultRoles: RoleOption[] = [
  { id: "translator", label: "Translator / Interpreter", enabled: true },
  { id: "helper", label: "Helper", enabled: true },
  { id: "host", label: "Host / Hostess", enabled: true },
  { id: "promoter", label: "Promoter", enabled: true },
  { id: "protocol", label: "Protocol Officer", enabled: true },
  { id: "info-desk", label: "Information Desk Executive", enabled: true },
];

const languages = [
  "English", "Hindi", "French", "German", "Spanish", "Italian", "Japanese",
  "Chinese (Mandarin)", "Chinese (Cantonese)", "Arabic", "Korean", "Russian",
  "Portuguese", "Dutch", "Turkish", "Thai", "Bengali", "Tamil", "Telugu", "Marathi",
];

const industries = [
  "Technology / IT", "Manufacturing", "Medical / Healthcare", "Legal", "Engineering",
  "Automotive", "Fashion / Apparel", "Food & Beverage", "Agriculture", "Defence", "Energy / Power",
];

const helperTasks = [
  "Booth Setup & Assembly", "Booth Dismantling", "Loading & Unloading",
  "Display & Fixture Arrangement", "Carpeting & Flooring Assistance",
  "Sticker / Graphics Pasting", "General Venue Assistance",
];

const promoterIndustries = [
  "Technology", "Consumer Electronics", "Automotive", "FMCG / Consumer Goods",
  "Pharmaceuticals", "Real Estate", "Education", "Finance & Insurance", "Industrial Equipment",
];

const shortLanguages = [
  "English", "Hindi", "French", "German", "Spanish", "Japanese", "Arabic",
  "Chinese (Mandarin)", "Bengali", "Tamil", "Telugu", "Marathi",
];

export const roleFieldConfig: Record<string, FieldConfig[]> = {
  translator: [
    { key: "Source Language", label: "Translate FROM which language", type: "select", options: languages, required: true },
    { key: "Target Language", label: "Translate TO which language", type: "select", options: languages, required: true },
    { key: "Interpretation Type", label: "Type of Interpretation", type: "select", options: ["Simultaneous Interpretation", "Consecutive Interpretation", "Booth-Side Language Assistance", "Written Translation", "All of the above"] },
    { key: "Specialized Industries", label: "Industries You Specialize In", type: "multi", options: industries },
    { key: "Language Certifications", label: "Any Language Certifications?", type: "input", placeholder: "e.g. NAATI, CIOL, ISO 17100" },
    { key: "Additional Languages", label: "Additional languages you know", type: "input", placeholder: "e.g. French, Arabic" },
  ],
  helper: [
    { key: "Helper Tasks", label: "Types of Tasks You Can Do", type: "multi", options: helperTasks, required: true },
    { key: "Physical Work Capability", label: "Can you lift heavy items / do physical work?", type: "select", options: ["Yes, fully capable", "Partially (light lifting only)", "No"] },
    { key: "Driving Licence", label: "Do you have a valid driving licence?", type: "select", options: ["Yes - Two Wheeler", "Yes - Four Wheeler", "Yes - Both", "No"] },
    { key: "Previous Venues", label: "Venues / places you have previously worked at", type: "input", placeholder: "e.g. Pragati Maidan, BEC Mumbai" },
  ],
  host: [
    { key: "Gender", label: "Gender", type: "select", options: ["Male", "Female", "Prefer not to say"], required: true },
    { key: "Height (cm)", label: "Height (in cm)", type: "input", placeholder: "e.g. 168" },
    { key: "Owns Formal Attire", label: "Do you own formal attire?", type: "select", options: ["Yes", "No"] },
    { key: "Languages Known", label: "Languages You Can Speak", type: "multi", options: shortLanguages, required: true },
    { key: "Previous Hosting Experience", label: "Previous brands / companies / events hosted", type: "textarea", placeholder: "e.g. Auto Expo 2023 for Maruti Suzuki" },
    { key: "Clothing Size", label: "Preferred clothing size", type: "select", options: ["XS", "S", "M", "L", "XL", "XXL"] },
  ],
  promoter: [
    { key: "Promotion Industries", label: "Industry / Sector You Can Promote In", type: "multi", options: promoterIndustries, required: true },
    { key: "Promotion Languages", label: "Languages You Can Promote / Present In", type: "multi", options: shortLanguages },
    { key: "Product Demo Experience", label: "Product Demonstration Experience", type: "select", options: ["Yes - Extensive (5+ demos)", "Yes - Some experience", "No - Willing to learn"] },
    { key: "Previously Promoted Brands", label: "Brands / Products Previously Promoted", type: "input", placeholder: "e.g. Samsung, Maruti Suzuki, Abbott" },
  ],
  protocol: [
    { key: "Fluent Languages", label: "Languages You Are Fluent In", type: "multi", options: ["English", "Hindi", "French", "German", "Spanish", "Japanese", "Arabic", "Chinese (Mandarin)", "Korean", "Russian", "Bengali", "Tamil"], required: true },
    { key: "VIP Management Experience", label: "VIP / Delegation Management Experience", type: "select", options: ["Yes - Government delegations", "Yes - Corporate VIPs", "Yes - Both", "No"] },
    { key: "Protocol Training", label: "Protocol / Etiquette Training", type: "select", options: ["Yes - Formally trained", "Yes - On the job", "No - Self-trained"] },
    { key: "Notable Delegations", label: "Notable Delegations / Events You Have Managed", type: "textarea", placeholder: "e.g. Ministry delegation at IITF 2022" },
  ],
  "info-desk": [
    { key: "Communication Languages", label: "Languages You Can Communicate In", type: "multi", options: shortLanguages, required: true },
    { key: "Computer Skills", label: "Computer / Software Skills", type: "input", placeholder: "e.g. MS Office, Excel, CRM tools" },
    { key: "Customer Service Experience", label: "Customer Service / Receptionist Experience", type: "select", options: ["Less than 1 year", "1-2 years", "3-5 years", "5+ years"] },
    { key: "Previous Info Desk Experience", label: "Previous companies / events where you managed an information desk", type: "textarea", placeholder: "e.g. FICCI - India International Trade Fair" },
  ],
};

export function parseRoles(value: string) {
  try {
    const parsed = JSON.parse(value) as RoleOption[];
    const enabled = parsed.filter((item) => item?.id && item?.label && item.enabled !== false);
    return enabled.length ? enabled : defaultRoles;
  } catch {
    return defaultRoles;
  }
}

export function validateRoleFields(role: string, values: RoleFields) {
  const missing = (roleFieldConfig[role] || []).find((field) => {
    if (!field.required) return false;
    const value = values[field.key];
    return Array.isArray(value) ? value.length === 0 : !value;
  });
  return missing ? `${missing.label} is required.` : "";
}

export function toPayloadLists(values: RoleFields) {
  const languages: string[] = [];
  const industriesOut: string[] = [];
  const taskDetails: string[] = [];

  Object.entries(values).forEach(([key, value]) => {
    const list = Array.isArray(value) ? value : value ? [value] : [];
    if (!list.length) return;
    if (key.toLowerCase().includes("language")) languages.push(...list);
    if (key.toLowerCase().includes("industr")) industriesOut.push(...list);
    taskDetails.push(`${key}: ${list.join(", ")}`);
  });

  return { languages, industries: industriesOut, tasks: taskDetails };
}
