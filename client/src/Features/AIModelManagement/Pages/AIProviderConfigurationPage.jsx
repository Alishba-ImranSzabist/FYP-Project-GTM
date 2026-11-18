import { useState } from "react";
import { ShieldCheck, TestTube } from "lucide-react";
import Button from "../../../Shared_Components/Button";
import FormField from "../../../Shared_Components/FormField";
import AIModelManagementLayout from "../components/AIModelManagementLayout";
import ConfigPageHeader from "../components/ConfigPageHeader";
import { ConfigPanel, FeedbackMessage, SelectField, ToggleField } from "../components/ConfigControls";
import useSessionDraft from "../Hooks/useSessionDraft";
import { AI_PROVIDER_OPTIONS, AI_PROVIDER_PRESETS } from "../aiModelManagementConfig";
import { validateProviderConfiguration } from "../aiModelManagementValidation";

const INITIAL_PROVIDER_DRAFT = {
  provider: "google",
  baseUrl: AI_PROVIDER_PRESETS.google.baseUrl,
  modelId: AI_PROVIDER_PRESETS.google.modelId,
  dailyQuota: "200",
  hourlyQuota: "20",
  enabled: true,
  isDefault: true,
};

export default function AIProviderConfigurationPage() {
  const { values, update, saveDraft, resetDraft } = useSessionDraft("provider-settings", INITIAL_PROVIDER_DRAFT);
  const [apiKey, setApiKey] = useState("");
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);

  const handleProviderChange = (provider) => {
    update("provider", provider);
    update("baseUrl", AI_PROVIDER_PRESETS[provider].baseUrl);
    update("modelId", AI_PROVIDER_PRESETS[provider].modelId);
    setApiKey("");
    setErrors({});
    setNotice(null);
  };

  const validate = () => {
    const nextErrors = validateProviderConfiguration(values, apiKey);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      setNotice({ type: "error", message: "Please correct the highlighted fields before saving the draft." });
      return;
    }
    saveDraft();
    setNotice({
      type: "success",
      message: "Provider settings passed frontend validation and were saved as a browser-session draft. The API key was not stored.",
    });
  };

  const handleTestConnection = () => {
    if (!validate()) {
      setNotice({ type: "error", message: "Complete the required provider fields before attempting a connection test." });
      return;
    }
    setNotice({
      type: "info",
      message: "No connection request was sent. A secure backend test-connection endpoint is required before provider connectivity can be verified.",
    });
  };

  return (
    <AIModelManagementLayout>
      <ConfigPageHeader
        title="AI Provider Configuration"
        description="Manage the external AI providers that power the Fast and Detailed model profiles."
      />

      <FeedbackMessage type="info">
        Frontend stage: settings are validated and drafted in this browser session. Provider API keys are kept in memory only and are never written to browser storage.
      </FeedbackMessage>

      <ConfigPanel
        title="Provider details"
        description="Choose a provider and enter its server-side connection details."
      >
        <div className="aimm-form-grid">
          <SelectField
            label="Provider"
            value={values.provider}
            onChange={handleProviderChange}
            options={AI_PROVIDER_OPTIONS}
            error={errors.provider}
          />
          <FormField
            label="API key"
            type="password"
            value={apiKey}
            onChange={(event) => { setApiKey(event.target.value); setErrors((current) => ({ ...current, apiKey: "" })); }}
            placeholder="Enter provider API key"
            autoComplete="off"
            error={errors.apiKey}
            hint="The key is not saved in sessionStorage or localStorage."
          />
          <FormField
            label="Base URL"
            value={values.baseUrl}
            onChange={(event) => update("baseUrl", event.target.value)}
            placeholder="https://api.provider.com/v1"
            error={errors.baseUrl}
          />
          <FormField
            label="Default model ID"
            value={values.modelId}
            onChange={(event) => update("modelId", event.target.value)}
            placeholder="Provider model identifier"
            error={errors.modelId}
          />
          <FormField
            label="Daily request quota"
            type="number"
            min="1"
            max="1000000"
            value={values.dailyQuota}
            onChange={(event) => update("dailyQuota", event.target.value)}
            error={errors.dailyQuota}
          />
          <FormField
            label="Hourly request quota"
            type="number"
            min="1"
            max="1000000"
            value={values.hourlyQuota}
            onChange={(event) => update("hourlyQuota", event.target.value)}
            error={errors.hourlyQuota}
          />
        </div>

        <div className="aimm-toggle-row">
          <ToggleField
            label="Enable provider"
            description="Allow the backend to select this provider when configured."
            checked={values.enabled}
            onChange={(checked) => update("enabled", checked)}
          />
          <ToggleField
            label="Set as default provider"
            description="Use this provider as the system-level default."
            checked={values.isDefault}
            onChange={(checked) => update("isDefault", checked)}
          />
        </div>

        {notice ? <FeedbackMessage type={notice.type}>{notice.message}</FeedbackMessage> : null}

        <div className="aimm-actions">
          <Button variant="ghost" size="sm" onClick={() => { resetDraft(); setApiKey(""); setErrors({}); setNotice(null); }}>
            Reset draft
          </Button>
          <div>
            <Button variant="outline" size="md" icon={TestTube} onClick={handleTestConnection}>
              Test connection
            </Button>
            <Button variant="accent" size="md" onClick={handleSave}>
              Save provider draft
            </Button>
          </div>
        </div>
      </ConfigPanel>

      <ConfigPanel
        title="Provider directory"
        description="The two providers selected for your platform. Connection status will be supplied by the backend integration."
      >
        <div className="aimm-provider-list">
          {AI_PROVIDER_OPTIONS.map((provider) => (
            <div className="aimm-provider-row" key={provider.value}>
              <span className={`aimm-provider-mark aimm-provider-mark--${provider.value}`}>
                {provider.value === "google" ? "G" : "A"}
              </span>
              <div className="aimm-provider-row__copy">
                <strong>{provider.label}</strong>
                <small>{AI_PROVIDER_PRESETS[provider.value].baseUrl}</small>
              </div>
              <span className="aimm-status aimm-status--pending">Not connected</span>
              <Button variant="ghost" size="sm" onClick={() => handleProviderChange(provider.value)}>Configure</Button>
            </div>
          ))}
        </div>
      </ConfigPanel>

      <div className="aimm-security-note">
        <ShieldCheck size={18} />
        <div>
          <strong>Credential security</strong>
          <p>Production API keys must be encrypted and stored on the server. Never place Gemini or Anthropic secrets in Vite environment variables or frontend source code.</p>
        </div>
      </div>
    </AIModelManagementLayout>
  );
}
