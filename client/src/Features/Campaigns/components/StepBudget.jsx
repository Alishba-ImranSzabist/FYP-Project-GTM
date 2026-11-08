import FormField from "../../../Shared_Components/FormField";
import { CHANNEL_OPTIONS, CURRENCY } from "../campaignConfig";
import ChipSelect from "./ChipSelect";

/** Step 3 — budget (or "let the AI suggest"), dates and channels. */
export default function StepBudget({ form }) {
  const { values, errors, handleChange, setValue, saving } = form;

  const toggleAiBudget = (event) => {
    const checked = event.target.checked;
    setValue("budgetAiSuggested", checked);
    if (checked) setValue("budget", ""); // a fixed budget and "AI decides" cannot both apply
  };

  return (
    <div className="cmp-grid">
      <div className="cmp-cell cmp-cell--full">
        <FormField
          label="Total budget (optional)"
          name="budget"
          type="number"
          inputMode="numeric"
          min="0"
          placeholder="e.g. 150000"
          hint={`Amount in ${CURRENCY}.`}
          value={values.budget}
          onChange={handleChange}
          error={errors.budget}
          disabled={saving || values.budgetAiSuggested}
        />
        <label className="cmp-check">
          <input
            type="checkbox"
            name="budgetAiSuggested"
            checked={values.budgetAiSuggested}
            onChange={toggleAiBudget}
            disabled={saving}
          />
          <span>I am not sure. Let the AI suggest a range.</span>
        </label>
      </div>

      <div className="cmp-cell">
        <FormField
          label="Start date *"
          name="startDate"
          type="date"
          value={values.startDate}
          onChange={handleChange}
          error={errors.startDate}
          disabled={saving}
        />
      </div>

      <div className="cmp-cell">
        <FormField
          label="End date *"
          name="endDate"
          type="date"
          min={values.startDate || undefined}
          value={values.endDate}
          onChange={handleChange}
          error={errors.endDate}
          disabled={saving}
        />
      </div>

      <div className="cmp-cell cmp-cell--full">
        <ChipSelect
          label="Channels you can use *"
          multiple
          options={CHANNEL_OPTIONS}
          value={values.channels}
          onChange={(next) => setValue("channels", next)}
          error={errors.channels}
          disabled={saving}
        />
      </div>
    </div>
  );
}
