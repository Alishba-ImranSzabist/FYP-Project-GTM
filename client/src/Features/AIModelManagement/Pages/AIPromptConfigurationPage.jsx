import { useEffect, useState } from "react";
import { FileText, Save } from "lucide-react";
import Button from "../../../Shared_Components/Button";
import { request } from "../../AIRecommendations/Services/recommendationApi.service";
import AIModelManagementLayout from "../components/AIModelManagementLayout";
import ConfigPageHeader from "../components/ConfigPageHeader";
import { ConfigPanel, FeedbackMessage } from "../components/ConfigControls";

const path = "/ai-recommendations/admin/config";

export default function AIPromptConfigurationPage() {
  const [config, setConfig] = useState(null);
  const [activeId, setActiveId] = useState("__global");
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let active = true;
    request(path)
      .then(({ config }) => { if (active) setConfig(config); })
      .catch((error) => { if (active) setFeedback({ type: "error", message: error.message }); });
    return () => { active = false; };
  }, []);

  const global = activeId === "__global";
  const section = config?.sections.find(({ id }) => id === activeId);
  const currentText = (global ? config?.adminInstructions : section?.prompt) || "";
  const title = global ? "Global strategy guidance" : section?.title;

  async function publish() {
    setSaving(true);
    setFeedback(null);
    try {
      const text = draft.trim();
      const result = await request(path, {
        method: "PUT",
        body: {
          expectedVersion: config.version,
          adminInstructions: global ? text : config.adminInstructions,
          sections: config.sections.map(({ id, title, prompt, enabled, order }) => ({
            id, title, enabled, order, prompt: id === activeId ? text : prompt,
          })),
        },
      });
      setConfig(result.config);
      setDraft(null);
      setFeedback({ type: "success", message: "Published. This guidance applies to new recommendations." });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AIModelManagementLayout>
      <ConfigPageHeader title="AI Prompt Configuration" description="Manage guidance used when Gemini generates recommendations." />
      {feedback && <FeedbackMessage type={feedback.type}>{feedback.message}</FeedbackMessage>}
      {config && (
        <div className="aimm-prompt-layout">
          <nav className="pnl-card aimm-prompt-nav" aria-label="Recommendation prompts">
            <div className="aimm-prompt-nav__list">
              {[{ id: "__global", title: "Global strategy guidance" }, ...config.sections].map(({ id, title }) => (
                <button
                  type="button"
                  key={id}
                  disabled={draft !== null}
                  className={`aimm-prompt-nav__item ${activeId === id ? "is-active" : ""}`}
                  onClick={() => { setActiveId(id); setFeedback(null); }}
                >
                  <FileText size={16} aria-hidden="true" /> <span>{title}</span>
                </button>
              ))}
            </div>
          </nav>
          <ConfigPanel
            title={title}
            description={global ? "Optional guidance applied alongside the app's evidence and output requirements." : "Instructions for this recommendation section when enabled."}
            actions={<span className="aimm-version-chip">Version {config.version}</span>}
          >
            <div className="aimm-prompt-editor">
              <label htmlFor="aimm-published-prompt">Prompt instructions</label>
              <textarea
                id="aimm-published-prompt"
                className="aimm-textarea aimm-textarea--prompt"
                value={draft ?? currentText}
                maxLength={3000}
                disabled={saving}
                onChange={(event) => setDraft(event.target.value)}
              />
            </div>
            {draft !== null && (
              <div className="aimm-actions">
                <Button variant="ghost" disabled={saving} onClick={() => setDraft(null)}>Cancel</Button>
                <Button variant="accent" icon={Save} loading={saving} disabled={saving || (!global && draft.trim().length < 10)} onClick={publish}>Publish prompt</Button>
              </div>
            )}
          </ConfigPanel>
        </div>
      )}
    </AIModelManagementLayout>
  );
}
