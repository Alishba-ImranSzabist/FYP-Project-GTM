import { useState } from "react";
import { Plus } from "lucide-react";
import FormField from "../../../Shared_Components/FormField";
import { AUDIENCE_OPTIONS, CAMPAIGN_LIMITS as L } from "../campaignConfig";
import ChipInput from "./ChipInput";
import ChipSelect from "./ChipSelect";

/** Step 2 — where, who, and which keywords describe the customer. */
export default function StepAudience({ form }) {
  const { values, errors, handleChange, setValue, saving } = form;
  const [showMore, setShowMore] = useState(Boolean(values.extraNotes)); // "+ Add more details"

  return (
    <div className="cmp-grid">
      <div className="cmp-cell cmp-cell--full">
        <ChipInput
          label="Target market (where) *"
          placeholder="+ Add location"
          values={values.targetLocations}
          onChange={(next) => setValue("targetLocations", next)}
          max={L.locations}
          maxLength={L.location}
          error={errors.targetLocations}
          disabled={saving}
        />
      </div>

      <div className="cmp-cell cmp-cell--full">
        <ChipSelect
          label="Who do you sell to? *"
          options={AUDIENCE_OPTIONS}
          value={values.audienceType}
          onChange={(value) => setValue("audienceType", value)}
          error={errors.audienceType}
          disabled={saving}
        />
      </div>

      <div className="cmp-cell cmp-cell--full">
        <ChipInput
          label="Keywords *"
          placeholder="+ Add keyword"
          values={values.keywords}
          onChange={(next) => setValue("keywords", next)}
          max={L.keywords}
          maxLength={L.keyword}
          hint="What would your customer search for? A rough guess is fine, the AI refines it later."
          error={errors.keywords}
          disabled={saving}
        />
      </div>

      <div className="cmp-cell">
        <FormField
          label="Audience"
          name="audience"
          placeholder="e.g. Women 22–34"
          maxLength={L.audience}
          value={values.audience}
          onChange={handleChange}
          error={errors.audience}
          disabled={saving}
        />
      </div>

      <div className="cmp-cell">
        <FormField
          label="Interests"
          name="interests"
          placeholder="e.g. fashion, lawn"
          maxLength={L.interests}
          value={values.interests}
          onChange={handleChange}
          error={errors.interests}
          disabled={saving}
        />
      </div>

      <div className="cmp-cell cmp-cell--full">
        {showMore ? (
          <FormField
            label="Anything else the AI should know?"
            name="extraNotes"
            multiline
            rows={3}
            maxLength={L.extraNotes}
            value={values.extraNotes}
            onChange={handleChange}
            error={errors.extraNotes}
            disabled={saving}
          />
        ) : (
          <button type="button" className="prof__link cmp-more" onClick={() => setShowMore(true)}>
            <Plus size={14} aria-hidden="true" /> Add more details (optional)
          </button>
        )}
      </div>
    </div>
  );
}
