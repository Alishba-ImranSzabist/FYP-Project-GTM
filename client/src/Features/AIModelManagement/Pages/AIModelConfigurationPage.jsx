import { useState } from "react";
import { Lock, Pencil, Plus, RotateCcw, Save, Trash2, X } from "lucide-react";
import Button from "../../../Shared_Components/Button";
import FormField from "../../../Shared_Components/FormField";
import AIModelManagementLayout from "../components/AIModelManagementLayout";
import ConfigPageHeader from "../components/ConfigPageHeader";
import { ConfigPanel, FeedbackMessage, ToggleField } from "../components/ConfigControls";
import useSessionDraft from "../Hooks/useSessionDraft";
import { DEFAULT_RECOMMENDATION_SETTINGS, MAX_RECOMMENDATION_SECTIONS } from "../aiModelManagementConfig";
import { validateRecommendationConfiguration, validateRecommendationSection } from "../aiModelManagementValidation";
import { createDefaultPromptForSection } from "../data/promptTemplates.js";
import { recommendationPromptSyncService } from "../Services/recommendationPromptSync.service.js";

const EMPTY_SECTION_FORM = { title: "", description: "" };
const QUALITY_FIELDS = [
  "minimumConfidence",
  "maxAudienceSegments",
  "maxChannels",
  "maxKeywords",
  "includeReasoning",
  "includeAssumptions",
  "requireEvidenceNotes",
];

function createSectionId(title, existingSections) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "recommendation";
  const baseId = `custom-${slug}-${Date.now().toString(36)}`;
  const existingIds = new Set(existingSections.map((section) => section.id));
  if (!existingIds.has(baseId)) return baseId;
  let suffix = 2;
  while (existingIds.has(`${baseId}-${suffix}`)) suffix += 1;
  return `${baseId}-${suffix}`;
}

function pickQualityValues(values) {
  return QUALITY_FIELDS.reduce((result, field) => {
    result[field] = values[field];
    return result;
  }, {});
}

export default function AIRecommendationConfigurationPage() {
  const { values, setValues, update, saveDraft } = useSessionDraft(
    "recommendation-settings",
    DEFAULT_RECOMMENDATION_SETTINGS
  );
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [isQualityEditing, setIsQualityEditing] = useState(false);
  const [qualitySnapshot, setQualitySnapshot] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSection, setNewSection] = useState(EMPTY_SECTION_FORM);
  const [newSectionErrors, setNewSectionErrors] = useState({});
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  const sections = Array.isArray(values.sections) ? values.sections : [];

  const updateSection = (sectionId, enabled) => {
    setValues((current) => ({
      ...current,
      enabledSections: { ...(current.enabledSections || {}), [sectionId]: enabled },
    }));
    setErrors((current) => ({ ...current, enabledSections: "" }));
    setNotice(null);
  };

  const handleStartQualityEdit = () => {
    setQualitySnapshot(pickQualityValues(values));
    setIsQualityEditing(true);
    setErrors({});
    setNotice(null);
  };

  const handleCancelQualityEdit = () => {
    if (qualitySnapshot) {
      setValues((current) => ({ ...current, ...qualitySnapshot }));
    }
    setQualitySnapshot(null);
    setIsQualityEditing(false);
    setErrors({});
    setNotice(null);
  };

  const handleSaveQualitySettings = () => {
    const nextErrors = validateRecommendationConfiguration(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      setNotice({ type: "error", message: "Please correct the highlighted settings before saving." });
      return;
    }

    const saved = saveDraft(values);
    if (!saved) {
      setNotice({ type: "error", message: "Could not save settings in this browser session. Check browser storage permissions." });
      return;
    }

    setQualitySnapshot(null);
    setIsQualityEditing(false);
    setNotice({
      type: "success",
      message: "Quality and output settings saved for this browser session. Backend integration is required to apply them to live AI generation.",
    });
  };

  const handleRestoreQualityDefaults = () => {
    const defaults = pickQualityValues(DEFAULT_RECOMMENDATION_SETTINGS);
    setValues((current) => ({ ...current, ...defaults }));
    setErrors({});
    setNotice({ type: "info", message: "Default quality values restored. Select Save changes to keep them for this session." });
  };

  const handleAddSection = () => {
    const sectionErrors = validateRecommendationSection(newSection, sections);
    if (sections.length >= MAX_RECOMMENDATION_SECTIONS) {
      sectionErrors.title = `You can add up to ${MAX_RECOMMENDATION_SECTIONS} recommendation sections.`;
    }
    setNewSectionErrors(sectionErrors);
    if (Object.keys(sectionErrors).length) return;

    const section = {
      id: createSectionId(newSection.title, sections),
      title: newSection.title.trim(),
      description: newSection.description.trim(),
    };
    section.defaultPrompt = createDefaultPromptForSection(section);

    const nextValues = {
      ...values,
      sections: [...sections, section],
      enabledSections: { ...(values.enabledSections || {}), [section.id]: true },
    };

    setValues(nextValues);
    const settingsSaved = saveDraft(nextValues);
    const promptSaved = recommendationPromptSyncService.addSection(section);
    setNewSection(EMPTY_SECTION_FORM);
    setNewSectionErrors({});
    setIsAddOpen(false);
    setNotice(settingsSaved && promptSaved
      ? { type: "success", message: "Recommendation section added and its prompt template created." }
      : { type: "error", message: "The section was added to the current view, but session saving failed. Check browser storage permissions." });
  };

  const handleDeleteSection = (section) => {
    if (sections.length <= 1) {
      setNotice({ type: "error", message: "At least one recommendation section must remain." });
      setDeleteCandidate(null);
      return;
    }

    const nextSections = sections.filter((item) => item.id !== section.id);
    const nextEnabledSections = { ...(values.enabledSections || {}) };
    delete nextEnabledSections[section.id];

    const nextValues = {
      ...values,
      sections: nextSections,
      enabledSections: nextEnabledSections,
    };

    setValues(nextValues);
    const settingsSaved = saveDraft(nextValues);
    const promptSaved = recommendationPromptSyncService.removeSection(section.id);
    setDeleteCandidate(null);
    setNotice(settingsSaved && promptSaved
      ? { type: "success", message: `“${section.title}” and its matching prompt template were removed.` }
      : { type: "error", message: "The section was removed from the current view, but browser-session saving failed." });
  };

  return (
    <AIModelManagementLayout>
      <ConfigPageHeader title="AI Recommendation Configuration" />

      <ConfigPanel
        title="Recommendation sections"
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => { setIsAddOpen((open) => !open); setNewSectionErrors({}); setNotice(null); }}
            disabled={sections.length >= MAX_RECOMMENDATION_SECTIONS}
          >
            Add section
          </Button>
        }
      >
        {isAddOpen ? (
          <div className="aimm-add-section-form">
            <div className="aimm-add-section-form__heading">
              <strong>New recommendation section</strong>
              <Button variant="ghost" size="sm" icon={X} onClick={() => { setIsAddOpen(false); setNewSection(EMPTY_SECTION_FORM); setNewSectionErrors({}); }}>Cancel</Button>
            </div>
            <div className="aimm-form-grid aimm-form-grid--two">
              <FormField
                label="Section name"
                value={newSection.title}
                onChange={(event) => setNewSection((current) => ({ ...current, title: event.target.value }))}
                placeholder="e.g. Competitor Positioning"
                maxLength={80}
                error={newSectionErrors.title}
              />
              <FormField
                label="What should AI recommend?"
                multiline
                rows={3}
                value={newSection.description}
                onChange={(event) => setNewSection((current) => ({ ...current, description: event.target.value }))}
                placeholder="Describe the output for this section..."
                maxLength={240}
                error={newSectionErrors.description}
              />
            </div>
            <div className="aimm-add-section-form__footer">
              <Button variant="accent" size="md" icon={Plus} onClick={handleAddSection}>Add recommendation</Button>
            </div>
          </div>
        ) : null}

        <div className="aimm-recommendation-list">
          {sections.map((section, index) => {
            const enabled = values.enabledSections?.[section.id] !== false;
            const confirmingDelete = deleteCandidate === section.id;
            return (
              <div className="aimm-recommendation-row" key={section.id}>
                <span className="aimm-recommendation-row__number">{String(index + 1).padStart(2, "0")}</span>
                <div className="aimm-recommendation-row__copy">
                  <strong>{section.title}</strong>
                  {section.description ? <p>{section.description}</p> : null}
                </div>
                <div className="aimm-recommendation-row__actions">
                  <ToggleField
                    label={enabled ? "Enabled" : "Disabled"}
                    checked={enabled}
                    onChange={(checked) => updateSection(section.id, checked)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    className="aimm-danger-button"
                    onClick={() => { setDeleteCandidate(confirmingDelete ? null : section.id); setNotice(null); }}
                    disabled={sections.length <= 1}
                  >
                    Delete
                  </Button>
                </div>
                {confirmingDelete ? (
                  <div className="aimm-delete-confirm" role="group" aria-label={`Confirm deletion of ${section.title}`}>
                    <span>Delete this section and its prompt template?</span>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteCandidate(null)}>Cancel</Button>
                    <Button variant="outline" size="sm" className="aimm-danger-button" onClick={() => handleDeleteSection(section)}>Confirm delete</Button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        {errors.sections ? <small className="aimm-field__error">{errors.sections}</small> : null}
        {errors.enabledSections ? <small className="aimm-field__error">{errors.enabledSections}</small> : null}
      </ConfigPanel>

      <ConfigPanel
        title="Quality and output limits"
        actions={
          isQualityEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={handleCancelQualityEdit}>Cancel</Button>
              <Button variant="outline" size="sm" icon={RotateCcw} onClick={handleRestoreQualityDefaults}>Restore defaults</Button>
              <Button variant="accent" size="sm" icon={Save} onClick={handleSaveQualitySettings}>Save changes</Button>
            </>
          ) : (
            <Button variant="outline" size="sm" icon={Pencil} onClick={handleStartQualityEdit}>Edit</Button>
          )
        }
      >
        <div className={`aimm-quality-settings ${isQualityEditing ? "is-editing" : "is-readonly"}`}>
          <div className="aimm-form-grid aimm-form-grid--four">
            <FormField
              label="Minimum recommendation match score (%)"
              type="number"
              min="0"
              max="100"
              value={values.minimumConfidence}
              onChange={(event) => update("minimumConfidence", event.target.value)}
              error={errors.minimumConfidence}
              disabled={!isQualityEditing}
            />
            <FormField
              label="Maximum audience segments"
              type="number"
              min="1"
              max="10"
              value={values.maxAudienceSegments}
              onChange={(event) => update("maxAudienceSegments", event.target.value)}
              error={errors.maxAudienceSegments}
              disabled={!isQualityEditing}
            />
            <FormField
              label="Maximum marketing channels"
              type="number"
              min="1"
              max="10"
              value={values.maxChannels}
              onChange={(event) => update("maxChannels", event.target.value)}
              error={errors.maxChannels}
              disabled={!isQualityEditing}
            />
            <FormField
              label="Maximum lead keywords"
              type="number"
              min="1"
              max="50"
              value={values.maxKeywords}
              onChange={(event) => update("maxKeywords", event.target.value)}
              error={errors.maxKeywords}
              disabled={!isQualityEditing}
            />
          </div>

          <div className="aimm-toggle-stack">
            <ToggleField
              label="Include reasoning"
              checked={values.includeReasoning}
              onChange={(checked) => update("includeReasoning", checked)}
              disabled={!isQualityEditing}
            />
            <ToggleField
              label="Include assumptions"
              checked={values.includeAssumptions}
              onChange={(checked) => update("includeAssumptions", checked)}
              disabled={!isQualityEditing}
            />
            <ToggleField
              label="Require evidence notes"
              checked={values.requireEvidenceNotes}
              onChange={(checked) => update("requireEvidenceNotes", checked)}
              disabled={!isQualityEditing}
            />
          </div>
        </div>

        <div className="aimm-approval-gate">
          <span className="aimm-approval-gate__icon"><Lock size={18} /></span>
          <div>
            <strong>Business user approval required before Apify discovery and Apollo enrichment</strong>
          </div>
          <span className="aimm-status aimm-status--enabled">Required</span>
        </div>

        {notice ? <FeedbackMessage type={notice.type}>{notice.message}</FeedbackMessage> : null}
      </ConfigPanel>
    </AIModelManagementLayout>
  );
}
