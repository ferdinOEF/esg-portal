// src/lib/ui/colors.ts
const CATEGORY_COLORS: Record<string, string> = {
  "Regulatory Frameworks (India)": "#ffb020",
  "EPR & Waste (India)": "#7dd87d",
  "Product Compliance (India)": "#e879f9",
  "Goa Environmental": "#5eead4",
  "Coastal/CRZ (Goa)": "#fb7185",
  "Trade & Carbon (EU)": "#60a5fa",
  "Due Diligence (EU)": "#f59e0b",
  "EEE Compliance (EU)": "#a78bfa",
  "Disclosure (Global)": "#34d399",
  "Management Systems (ISO)": "#f472b6",
  "Carbon Accounting (Global)": "#38bdf8",
  "Carbon Targets (Global)": "#22d3ee",
  "Enablement/Certification (India)": "#fbbf24",
};

export function getAccentColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "#8b9bff";
}
