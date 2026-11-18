import { useMemo, useState } from "react";
import { FileText, Pencil, RotateCcw, Save, X } from "lucide-react";
import Button from "../../../Shared_Components/Button";
import AIModelManagementLayout from "../components/AIModelManagementLayout";
import ConfigPageHeader from "../components/ConfigPageHeader";
import { ConfigPanel, FeedbackMessage } from "../components/ConfigControls";
import useSessionDraft from "../Hooks/useSessionDraft";
import { DEFAULT_RECOMMENDATION_SETTINGS } from "../aiModelManagementConfig";
import { adminAIConfigDraftService } from "../Services/adminAIConfigDraft.service.js";
import { buildPromptTemplates } from "../data/promptTemplates.js";
import { validatePromptText } from "../aiModelManagementValidation";

export default function AIPromptConfigurationPage() {
  const recommendationSettings = useMemo(
    () => adminAIConfigDraftService.read("recommendation-settings", DEFAULT_RECOMMENDATION_SETTINGS),
    []
  );
  const promptTemplates = useMemo(
    () => buildPromptTemplates(recommendationSettings.sections || []),
    [recommendationSettings.sections]
  );
  const defaultPrompts = useMemo(
    () => Object.fromEntries(promptTemplates.map((item) => [item.id, item.defaultText])),
    [promptTemplates]
  );
  const initialPromptDraft = useMemo(() => ({ prompts: defaultPrompts }), [defaultPrompts]);

  const { values, setValues, saveDraft } = useSessionDraft("prompt-settings", initialPromptDraft);
  const [activePromptId, setActivePromptId] = useState("global");
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editSnapshot, setEditSnapshot] = useState(null);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);

  const activePrompt = promptTemplates.find((item) => item.id === activePromptId) || promptTemplates[0];
  const currentPromptId = activePrompt?.id || "global";
  const promptText = values.prompts?.[currentPromptId] ?? activePrompt?.defaultText ?? "";
  const characterCount = promptText.length;

  const updatePrompt = (nextText) => {
    setValues((current) => ({
      ...current,
      prompts: { ...(current.prompts || {}), [currentPromptId]: nextText },
    }));
    setError("");
    setNotice(null);
  };

  const handleStartEdit = () => {
    setEditSnapshot(promptText);
    setIsEditing(true);
    setError("");
    setNotice(null);
  };

  const handleCancelEdit = () => {
    if (editSnapshot !== null) updatePrompt(editSnapshot);
    setIsEditing(false);
    setEditSnapshot(null);
    setError("");
    setNotice(null);
  };

  const handleSave = () => {
    const validationError = validatePromptText(promptText);
    setError(validationError);
    if (validationError) return;

    const nextValues = {
      ...values,
      prompts: { ...(values.prompts || {}), [currentPromptId]: promptText },
    };
    const saved = saveDraft(nextValues);
    if (!saved) {
      setNotice({ type: "error", message: "Could not save this prompt in browser-session storage. Check browser storage permissions." });
      return;
    }

    setIsEditing(false);
    setEditSnapshot(null);
    setNotice({ type: "success", message: "Prompt draft saved in this browser session. It has not been published to the live backend." });
  };

  const handleRestoreDefault = () => {
    const defaultText = activePrompt?.defaultText || "";
    const originalDraft = editSnapshot !== null ? editSnapshot : promptText;
    setValues((current) => ({
      ...current,
      prompts: { ...(current.prompts || {}), [currentPromptId]: defaultText },
    }));
    setEditSnapshot(originalDraft);
    setIsEditing(true);
    setRestoreConfirmOpen(false);
    setError("");
    setNotice({ type: "info", message: "The original template has been restored in the editor. Review it and select Save prompt draft to confirm." });
  };

  const handleSelectPrompt = (promptId) => {
    setActivePromptId(promptId);
    setIsEditing(false);
    setEditSnapshot(null);
    setRestoreConfirmOpen(false);
    setError("");
    setNotice(null);
  };

  return (
    <AIModelManagementLayout>
      <ConfigPageHeader
        title="AI Prompt Configuration"
        description="Review and edit the global system prompt and the template for each recommendation section."
      />

      <FeedbackMessage type="info">
        Prompt templates stay synchronized with AI Recommendation Configuration. New recommendation sections automatically appear in this list.
      </FeedbackMessage>

      <div className="aimm-prompt-layout">
        <aside className="pnl-card aimm-prompt-nav">
          <div className="aimm-prompt-nav__heading">
            <strong>Prompt templates</strong>
            <span>{promptTemplates.length} templates</span>
          </div>
          <div className="aimm-prompt-nav__list">
            {promptTemplates.map((prompt) => (
              <button
                type="button"
                key={prompt.id}
                className={`aimm-prompt-nav__item ${currentPromptId === prompt.id ? "is-active" : ""}`}
                onClick={() => handleSelectPrompt(prompt.id)}
              >
                <FileText size={16} />
                <span>{prompt.label}</span>
              </button>
            ))}
          </div>
        </aside>

        <ConfigPanel
          title={activePrompt?.label || "Global System Prompt"}
          description={activePrompt?.description || "Shared instructions for all recommendation prompts."}
          actions={(
            <>
              <span className="aimm-version-chip">Session draft</span>
              {!isEditing ? (
                <Button variant="outline" size="sm" icon={Pencil} onClick={handleStartEdit}>Edit Prompt</Button>
              ) : null}
            </>
          )}
        >
          {isEditing ? (
            <div className="aimm-prompt-editor">
              <label htmlFor="aimm-prompt-text">Prompt instructions</label>
              <textarea
                id="aimm-prompt-text"
                className="aimm-textarea aimm-textarea--prompt"
                value={promptText}
                onChange={(event) => updatePrompt(event.target.value)}
                maxLength={8000}
                spellCheck="true"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "aimm-prompt-error" : "aimm-prompt-help"}
              />
              <div className="aimm-prompt-editor__meta">
                <small id="aimm-prompt-help">Use placeholders such as {"{{campaign_name}}"} where the backend inserts campaign data.</small>
                <strong className={characterCount > 7600 ? "is-near-limit" : ""}>{characterCount.toLocaleString()} / 8,000 characters</strong>
              </div>
              {error ? <small id="aimm-prompt-error" className="aimm-field__error" role="alert">{error}</small> : null}
            </div>
          ) : (
            <div className="aimm-prompt-preview-wrap">
              <div className="aimm-prompt-preview__heading">
                <strong>Current prompt</strong>
                <span>{characterCount.toLocaleString()} / 8,000 characters</span>
              </div>
              <pre className="aimm-prompt-preview">{promptText || "No prompt text is available. Select Edit Prompt to add instructions."}</pre>
            </div>
          )}

          {restoreConfirmOpen ? (
            <div className="aimm-restore-confirm" role="alertdialog" aria-label="Confirm restore default prompt">
              <div>
                <strong>Restore the original template?</strong>
                <p>This replaces the current draft for “{activePrompt?.label}”. You can review the restored text before saving it.</p>
              </div>
              <div className="aimm-restore-confirm__actions">
                <Button variant="ghost" size="sm" onClick={() => setRestoreConfirmOpen(false)}>Cancel</Button>
                <Button variant="outline" size="sm" onClick={handleRestoreDefault}>Restore default</Button>
              </div>
            </div>
          ) : null}

          {notice ? <FeedbackMessage type={notice.type}>{notice.message}</FeedbackMessage> : null}

          <div className="aimm-actions">
            <div>
              <Button variant="ghost" size="sm" icon={RotateCcw} onClick={() => setRestoreConfirmOpen(true)}>Restore default</Button>
            </div>
            {isEditing ? (
              <div>
                <Button variant="ghost" size="sm" icon={X} onClick={handleCancelEdit}>Cancel</Button>
                <Button variant="accent" size="md" icon={Save} onClick={handleSave}>Save prompt draft</Button>
              </div>
            ) : null}
          </div>
        </ConfigPanel>
      </div>
    </AIModelManagementLayout>
  );
}
