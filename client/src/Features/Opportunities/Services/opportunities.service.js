import { demoOpportunities } from "../Data/opportunities.data";

// Frontend demo adapter. Replace these methods with authenticated API calls
// when the Opportunities Discovery backend is implemented.
export const opportunitiesService = {
  async list() {
    return demoOpportunities;
  },
  async findContact(id) {
    const opportunity = demoOpportunities.find((item) => item.id === id);
    if (!opportunity) throw new Error("Opportunity not found.");
    return opportunity;
  },
};
