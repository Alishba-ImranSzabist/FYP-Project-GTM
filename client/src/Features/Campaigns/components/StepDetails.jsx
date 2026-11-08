import FormField from "../../../Shared_Components/FormField";
import { CAMPAIGN_LIMITS, OBJECTIVE_OPTIONS } from "../campaignConfig";
import ChipSelect from "./ChipSelect";

/** Step 1 — name, objective, product and a short description. */
export default function StepDetails({ form }) {
  const { values, errors, handleChange, setValue, saving } = form;

  return (
    <div className="cmp-grid">
      <div className="cmp-cell cmp-cell--full">
        <FormField
          label="Campaign name *"
          name="name"
          placeholder="e.g. Summer Collection Launch"
          maxLength={CAMPAIGN_LIMITS.name}
          value={values.name}
          onChange={handleChange}
          error={errors.name}
          disabled={saving}
        />
      </div>

      <div className="cmp-cell cmp-cell--full">
        <ChipSelect
          label="Main objective *"
          options={OBJECTIVE_OPTIONS}
          value={values.objective}
          onChange={(value) => setValue("objective", value)}
          error={errors.objective}
          disabled={saving}
        />
      </div>

      <div className="cmp-cell">
        <FormField
          label="Product or offer *"
          name="productName"
          placeholder="e.g. Summer Collection"
          maxLength={CAMPAIGN_LIMITS.productName}
          value={values.productName}
          onChange={handleChange}
          error={errors.productName}
          disabled={saving}
        />
      </div>

      <div className="cmp-cell">
        <FormField
          label="Industry (from your profile)"
          name="industry"
          placeholder="e.g. Fashion & retail"
          maxLength={CAMPAIGN_LIMITS.industry}
          value={values.industry}
          onChange={handleChange}
          error={errors.industry}
          disabled={saving}
        />
      </div>

      <div className="cmp-cell cmp-cell--full">
        <FormField
          label="What are you offering?"
          name="description"
          multiline
          rows={4}
          placeholder="e.g. Lightweight lawn and cotton outfits for women, ready to wear, launching for the summer season."
          maxLength={CAMPAIGN_LIMITS.description}
          hint="Tip: mention your price level and what makes it different. The AI uses this to give better recommendations."
          value={values.description}
          onChange={handleChange}
          error={errors.description}
          disabled={saving}
        />
      </div>
    </div>
  );
}
