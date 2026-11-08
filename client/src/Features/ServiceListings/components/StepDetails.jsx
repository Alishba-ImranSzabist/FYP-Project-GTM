import FormField from "../../../Shared_Components/FormField";
import ChipInput from "../../Campaigns/components/ChipInput";
import { AVAILABILITY_OPTIONS, EXPERIENCE_OPTIONS, SERVICE_LIMITS as L } from "../serviceListingConfig";
import SelectField from "./SelectField";

/** Step 2 — optional experience, portfolio, rate, availability, location and languages. */
export default function StepDetails({ form }) {
  const { values, errors, handleChange, setValue, saving } = form;

  return (
    <div className="cmp-grid">
      <div className="cmp-cell">
        <SelectField
          label="Experience"
          name="experience"
          options={EXPERIENCE_OPTIONS}
          value={values.experience}
          onChange={handleChange}
          error={errors.experience}
          disabled={saving}
        />
      </div>

      <div className="cmp-cell">
        <FormField
          label="Portfolio link (from profile)"
          name="portfolioLink"
          type="url"
          placeholder="https://example.com/portfolio"
          maxLength={L.portfolioLink}
          value={values.portfolioLink}
          onChange={handleChange}
          error={errors.portfolioLink}
          disabled={saving}
        />
      </div>

      <div className="cmp-cell">
        <FormField
          label="Typical rate"
          name="rate"
          placeholder="e.g. PKR 10,000 per video"
          maxLength={L.rate}
          value={values.rate}
          onChange={handleChange}
          error={errors.rate}
          disabled={saving}
        />
      </div>

      <div className="cmp-cell">
        <SelectField
          label="Availability"
          name="availability"
          options={AVAILABILITY_OPTIONS}
          value={values.availability}
          onChange={handleChange}
          error={errors.availability}
          disabled={saving}
        />
      </div>

      <div className="cmp-cell">
        <ChipInput
          label="Location"
          placeholder="+ Add location"
          values={values.locations}
          onChange={(next) => setValue("locations", next)}
          max={L.locations}
          maxLength={L.location}
          hint='A city, or "Remote". Press Enter to add each one.'
          error={errors.locations}
          disabled={saving}
        />
      </div>

      <div className="cmp-cell">
        <FormField
          label="Languages"
          name="languages"
          placeholder="Urdu, English"
          maxLength={L.languages}
          value={values.languages}
          onChange={handleChange}
          error={errors.languages}
          disabled={saving}
        />
      </div>
    </div>
  );
}
