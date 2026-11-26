import { useEffect, useState } from "react";
import { request } from "../../AIRecommendations/Services/recommendationApi.service";
import { ConfigPanel, FeedbackMessage } from "../components/ConfigControls";

export default function ActiveModelSettings() {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    request("/ai-recommendations/admin/model")
      .then((data) => { if (active) setSettings(data); })
      .catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, []);

  return (
    <>
      {error && <FeedbackMessage type="error">{error}</FeedbackMessage>}
      <ConfigPanel title="Active runtime" description="These values come from the backend environment.">
        {settings ? (
          <dl className="aimm-runtime-settings">
            <div><dt>Gemini API key</dt><dd>{settings.credentialsConfigured ? "Configured on server" : "Missing"}</dd></div>
            <div>
              <dt>Gemini model</dt>
              <dd>{settings.model}</dd>
            </div>
            <div>
              <dt>Maximum output tokens</dt>
              <dd>{settings.maxOutputTokens.toLocaleString()} per response</dd>
            </div>
            <div>
              <dt>Request timeout</dt>
              <dd>{settings.requestTimeoutMs / 1000} seconds</dd>
            </div>
          </dl>
        ) : !error && <p role="status">Loading model settings...</p>}
      </ConfigPanel>
    </>
  );
}
