import { useEffect, useMemo, useState } from "react";
import { Coins, Search, Sparkles, Users } from "lucide-react";
import FormField from "../../../Shared_Components/FormField";
import AIModelManagementLayout from "../components/AIModelManagementLayout";
import ConfigPageHeader from "../components/ConfigPageHeader";
import { ConfigPanel, FeedbackMessage } from "../components/ConfigControls";

import { request } from "../../AIRecommendations/Services/recommendationApi.service";

const formatCount = (value) => Number(value || 0).toLocaleString();

const outcomeLabels = {
  gemini: "Gemini plan saved",
  fallback: "Rules-based plan saved",
  reused: "Existing plan kept",
  failed: "Generation failed",
};

function providerResult(attempt) {
  if (attempt.providerStatus === 429) return "429 - Quota or rate limit";
  if (attempt.providerStatus === 503) return "503 - Provider unavailable";
  if (attempt.providerStatus === 200) return "200 - Response received";
  if (attempt.providerStatus) return `HTTP ${attempt.providerStatus}`;
  if (attempt.errorStatus === 504) return "Request timed out";
  if (attempt.errorStatus) return `App error ${attempt.errorStatus}`;
  return "Skipped during cooldown";
}

export default function AIUsageLogsPage() {
  const [search, setSearch] = useState("");
  const [usageRecords, setUsageRecords] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    request("/ai-recommendations/admin/usage")
      .then(({ records, attempts }) => {
        if (!active) return;
        setUsageRecords(records);
        setAttempts(attempts ?? []);
      })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return usageRecords;
    return usageRecords.filter((record) =>
      [record.userId, record.userName, record.modelName, record.provider === "rules" ? "rules-based" : "gemini"]
        .some((value) => String(value || "").toLowerCase().includes(query))
    );
  }, [search, usageRecords]);

  const totalUsers = new Set(usageRecords.map((record) => record.userId)).size;
  const totalRequests = usageRecords.reduce((total, record) => total + Number(record.requestCount || 0), 0);
  const totalTokens = usageRecords.reduce((total, record) => total + Number(record.totalTokens || 0), 0);

  const stats = [
    { label: "Total users", value: usageRecords.length ? formatCount(totalUsers) : "—", note: "Users with saved plans", icon: Users },
    { label: "Recommendations", value: usageRecords.length ? formatCount(totalRequests) : "—", note: "Saved recommendations", icon: Sparkles },
    { label: "Total Gemini tokens used", value: usageRecords.length ? formatCount(totalTokens) : "—", note: "Input and output tokens reported for saved plans", icon: Coins },
  ];

  return (
    <AIModelManagementLayout className="aimm-usage-page">
      <ConfigPageHeader
        title="AI Usage & Logs"
        description="Review saved plans, Gemini token usage and recent generation attempts."
      />

      {error && <FeedbackMessage type="error">{error}</FeedbackMessage>}

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
        title="Saved recommendations"
        description="Gemini and rules-based plans saved by each user over the last 30 days."
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
                <th>Generation source</th>
                <th>Recommendations</th>
                <th>Tokens used</th>
                <th>Last used</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length ? filteredRecords.map((record) => (
                <tr key={`${record.userId}-${record.provider + "-" + record.modelName}`}>
                  <td>{record.userId || "—"}</td>
                  <td>{record.userName || "—"}</td>
                  <td>
                    <span className="aimm-usage-model-badge">
                      {record.provider === "rules" ? "Rules-based plan" : record.modelName || "Gemini"}
                    </span>
                  </td>
                  <td>{formatCount(record.requestCount)}</td>
                  <td>{formatCount(record.totalTokens)}</td>
                  <td>{record.lastUsedAt ? new Date(record.lastUsedAt).toLocaleString() : "—"}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="aimm-usage-table__empty">
                    {loading ? "Loading usage..." : error || (search ? "No matching user usage records found." : "No recommendations were saved in the last 30 days.")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ConfigPanel>
      <ConfigPanel
        title="Recent generation attempts"
        description="Up to 50 recent attempts. Provider tokens are shown when reported."
      >
        <div className="aimm-usage-table-wrap">
          <table className="aimm-usage-table">
            <thead>
              <tr><th>Time</th><th>Campaign</th><th>Gemini model</th><th>Provider result</th><th>Plan outcome</th><th>Tokens</th></tr>
            </thead>
            <tbody>
              {attempts.length ? attempts.map((attempt) => (
                <tr key={attempt._id}>
                  <td>{new Date(attempt.createdAt).toLocaleString()}</td>
                  <td>{attempt.campaignName}</td>
                  <td>{attempt.model}</td>
                  <td>{providerResult(attempt)}</td>
                  <td>{outcomeLabels[attempt.outcome]}{attempt.providerStatus && attempt.errorStatus && attempt.outcome === "failed" ? ` (app ${attempt.errorStatus})` : ""}</td>
                  <td>{attempt.totalTokens == null ? "Unavailable" : formatCount(attempt.totalTokens)}</td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="aimm-usage-table__empty">{loading ? "Loading attempts..." : error || "Attempts will appear after the next generation request."}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </ConfigPanel>
    </AIModelManagementLayout>
  );
}
