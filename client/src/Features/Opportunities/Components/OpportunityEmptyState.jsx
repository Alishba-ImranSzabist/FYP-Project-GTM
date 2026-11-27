import { Search } from "lucide-react";

export default function OpportunityEmptyState({ message = "No opportunities match this search. Try a broader term." }) {
  return (
    <div className="opp-empty">
      <Search size={22} />
      <p>{message}</p>
    </div>
  );
}
