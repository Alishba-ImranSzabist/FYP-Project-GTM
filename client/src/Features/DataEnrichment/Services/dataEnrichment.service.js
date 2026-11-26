import { demoLeads } from "../data/demoData";

/**
 * Demo adapter for the Data & Enrichment feature.
 * Replace these methods with API requests when the Express backend is ready.
 * API keys must never be stored in this frontend service.
 */
export const dataEnrichmentService = {
  async getLeads() {
    return demoLeads.map((lead) => ({ ...lead }));
  },

  async enrichLeads(leads, selectedIds) {
    // Visual demo only: this does not call Apollo or verify contact details.
    return leads.map((lead) =>
      selectedIds.includes(lead.id) && lead.status !== "Enriched"
        ? { ...lead, status: "Enriched" }
        : lead
    );
  },

  exportLeadsCsv(leads, filename = "gtm-leads-demo.csv") {
    const columns = ["Name", "Role", "Company", "Email", "Phone", "Source", "Status", "Score"];
    const rows = [
      columns.join(","),
      ...leads.map((lead) =>
        [lead.name, lead.role, lead.company, lead.email, lead.phone, lead.source, lead.status, lead.score]
          .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
          .join(",")
      ),
    ];

    const blob = new Blob([rows.join("\\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },
};
