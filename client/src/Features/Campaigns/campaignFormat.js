import { CURRENCY } from "./campaignConfig";

/** Small display helpers. Dates are formatted in UTC because the API stores date-only values at UTC midnight. */

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/** "10 Nov – 10 Dec" (empty string when either date is missing). */
export const formatDateRange = (start, end) =>
  start && end ? `${formatDate(start)} – ${formatDate(end)}` : "";

/** "PKR 150,000" / "AI will suggest a range" / "" (no budget). Works for API data and form values. */
export function formatBudget({ budget, budgetAiSuggested }) {
  if (budgetAiSuggested) return "AI will suggest a range";
  if (budget === null || budget === undefined || budget === "") return "";
  return `${CURRENCY} ${Number(budget).toLocaleString("en-US")}`;
}

/** "just now", "5 min ago", "3 hr ago", "2 days ago", then a plain date. */
export function timeAgo(value) {
  const minutes = Math.floor(Math.max(0, Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(value);
}
