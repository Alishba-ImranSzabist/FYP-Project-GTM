import FormField from "../../../Shared_Components/FormField";
import ChipInput from "../../Campaigns/components/ChipInput";
import ChipSelect from "../../Campaigns/components/ChipSelect";
import { CATEGORY_OPTIONS, SERVICE_LIMITS as L } from "../serviceListingConfig";

/** Step 1 — service name, category, description and keywords. */
export default function StepOffer({ form }) {
  const { values, errors, handleChange, setValue, saving } = form;

  return (
    <div className="cmp-grid">
      <div className="cmp-cell cmp-cell--full">
        <FormField
          label="Service name *"
          name="name"
          placeholder="e.g. Video editing for reels and short films"
          maxLength={L.name}
          value={values.name}
          onChange={handleChange}
          error={errors.name}
          disabled={saving}
        />
      </div>

      <div className="cmp-cell cmp-cell--full">
        <ChipSelect
          label="Category *"
          options={CATEGORY_OPTIONS}
          value={values.category}
          onChange={(value) => setValue("category", value)}
          error={errors.category}
          disabled={saving}
        />
      </div>

      {values.category === "other" && (
        <div className="cmp-cell cmp-cell--full">
          <FormField
            label="What kind of service? *"
            name="customCategory"
            placeholder="e.g. Voice-over"
            maxLength={L.customCategory}
            value={values.customCategory}
            onChange={handleChange}
            error={errors.customCategory}
            disabled={saving}
          />
        </div>
      )}

      <div className="cmp-cell cmp-cell--full">
        <FormField
          label="Describe your service *"
          name="description"
          multiline
          rows={4}
          placeholder="e.g. I edit short-form video for creators and small brands. Fast turnaround, colour grading and subtitles included."
          maxLength={L.description}
          value={values.description}
          onChange={handleChange}
          error={errors.description}
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
          hint='Words that appear in posts when someone needs your service, e.g. "looking for an editor".'
          error={errors.keywords}
          disabled={saving}
        />
      </div>

      <div className="cmp-cell cmp-cell--full">
        <ChipInput
          label="Target market (optional)"
          placeholder="+ Add target market"
          values={values.targetMarket}
          onChange={(next) => setValue("targetMarket", next)}
          max={L.targetMarkets}
          maxLength={L.targetMarket}
          hint='Who do you want as clients? e.g. "Influencers", "Brands", "Startups". Press Enter to add each one.'
          error={errors.targetMarket}
          disabled={saving}
        />
      </div>
    </div>
  );
}
