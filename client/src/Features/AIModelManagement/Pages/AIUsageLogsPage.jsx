import { useMemo, useState } from "react";
import { Coins, Search, Sparkles, Users } from "lucide-react";
import FormField from "../../../Shared_Components/FormField";
import AIModelManagementLayout from "../components/AIModelManagementLayout";
import ConfigPageHeader from "../components/ConfigPageHeader";
import { ConfigPanel, FeedbackMessage } from "../components/ConfigControls";

/**
 * Frontend-only usage view. Replace the empty array with records from the
 * authenticated admin usage API when that endpoint is implemented.
 * One row should represent one user + model combination.
 */
const usageRecords = [];

const formatCount = (value) => Number(value || 0).toLocaleString();

export default function AIUsageLogsPage() {
  const [search, setSearch] = useState("");

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return usageRecords;
    return usageRecords.filter((record) =>
      [record.userId, record.userName, record.modelName, record.modelProfile]
        .some((value) => String(value || "").toLowerCase().includes(query))
    );
  }, [search]);

  const totalUsers = new Set(usageRecords.map((record) => record.userId)).size;
  const totalRequests = usageRecords.reduce((total, record) => total + Number(record.requestCount || 0), 0);
  const totalTokens = usageRecords.reduce((total, record) => total + Number(record.totalTokens || 0), 0);

  const stats = [
    { label: "Total users", value: usageRecords.length ? formatCount(totalUsers) : "—", note: "Users who used AI", icon: Users },
    { label: "AI requests", value: usageRecords.length ? formatCount(totalRequests) : "—", note: "Total model requests", icon: Sparkles },
    { label: "Tokens consumed", value: usageRecords.length ? formatCount(totalTokens) : "—", note: "Input + output tokens", icon: Coins },
  ];

  return (
    <AIModelManagementLayout>
      <ConfigPageHeader
        title="AI Usage & Logs"
        description="See which users use AI, which model they use, and how many requests and tokens they consume."
      />

      <FeedbackMessage type="info">
        Usage figures will appear when the backend usage API records each AI request. No sample or estimated user activity is shown here.
      </FeedbackMessage>

      <div className="aimm-usage-stats aimm-usage-stats--simple">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article className="aimm-usage-stat" key={stat.label}>
              <span className="aimm-usage-stat__icon"><Icon size={18} /></span>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.note}</small>
            </article>
          );
        })}
      </div>

      <ConfigPanel
        title="User usage"
        description="A row represents one user and the model profile they used. If a user used both models, they will have a separate row for each model."
      >
        <div className="aimm-usage-search">
          <FormField
            label="Search by user ID, name or model"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="e.g. U-102, Samra or Gemini Flash"
          />
          <span className="aimm-usage-search__icon"><Search size={18} /></span>
        </div>

        <div className="aimm-usage-table-wrap">
          <table className="aimm-usage-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>User name</th>
                <th>Model used</th>
                <th>Requests</th>
                <th>Tokens used</th>
                <th>Last used</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length ? filteredRecords.map((record) => (
                <tr key={`${record.userId}-${record.modelProfile || record.modelName}`}>
                  <td>{record.userId || "—"}</td>
                  <td>{record.userName || "—"}</td>
                  <td>
                    <span className="aimm-usage-model-badge">
                      {record.modelName || (record.modelProfile === "fast" ? "Gemini Flash" : record.modelProfile === "detailed" ? "Claude Sonnet" : "Unknown model")}
                    </span>
                  </td>
                  <td>{formatCount(record.requestCount)}</td>
                  <td>{formatCount(record.totalTokens)}</td>
                  <td>{record.lastUsedAt ? new Date(record.lastUsedAt).toLocaleString() : "—"}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="aimm-usage-table__empty">
                    {search ? "No matching user usage records found." : "No user usage records are available yet. Records will appear here after the backend logging API is connected."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ConfigPanel>
    </AIModelManagementLayout>
  );
}
