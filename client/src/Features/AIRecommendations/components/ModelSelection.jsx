import { Check, Search, Zap, ShieldCheck, Scale, Lightbulb } from "lucide-react";
import { AI_RECOMMENDATION_MODELS, AI_RECOMMENDATION_STYLES } from "../recommendationSettings.js";

const MODEL_ICONS = { fast: Zap, detailed: Search };
const STYLE_ICONS = {
  conservative: ShieldCheck,
  balanced: Scale,
  creative: Lightbulb,
};

function ScoreMeter({ label, score }) {
  return (
    <div className="air-score-meter">
      <span>{label}</span>
      <div aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <i key={index} className={index < score ? "is-filled" : ""} />
        ))}
      </div>
    </div>
  );
}

export default function ModelSelection({ value, onChange, styleValue, onStyleChange }) {
  return (
    <section className="air-model-section" aria-labelledby="air-model-title">
      <div className="air-section-heading">
        <div>
          <span className="air-kicker">STEP 1 · MODEL</span>
          <h2 id="air-model-title">Choose your AI model</h2>
          <p>Pick one before we generate recommendations for this campaign.</p>
        </div>
      </div>

      <div className="air-model-grid">
        {AI_RECOMMENDATION_MODELS.map((model) => {
          const Icon = MODEL_ICONS[model.id];
          const selected = value === model.id;
          return (
            <button
              key={model.id}
              type="button"
              className={`air-model-card ${selected ? "is-selected" : ""}`}
              onClick={() => onChange(model.id)}
              aria-pressed={selected}
            >
              <span className="air-model-card__topline">
                <span className={`air-model-card__icon air-model-card__icon--${model.id}`}>
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span className="air-model-card__radio" aria-hidden="true">
                  {selected && <Check size={13} />}
                </span>
              </span>
              <span className="air-model-card__label">{model.label}</span>
              <strong>{model.name}</strong>
              <span className="air-model-card__provider">{model.provider}</span>
              <span className="air-model-card__description">{model.description}</span>
              <ul>
                {model.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
              </ul>
              <div className="air-model-card__scores">
                <ScoreMeter label="Speed" score={model.speedScore} />
                <ScoreMeter label="Detail" score={model.detailScore} />
              </div>
              <span className="air-model-card__time">Typical time <strong>{model.typicalTime}</strong></span>
            </button>
          );
        })}
      </div>

      <section className="air-style-section" aria-labelledby="air-style-title">
        <div className="air-section-heading">
          <div>
            <span className="air-kicker">STEP 2 · APPROACH</span>
            <h2 id="air-style-title">Recommendation Style</h2>
            <p>Choose how AI should approach your marketing recommendations.</p>
          </div>
        </div>

        <div className="air-style-grid">
          {AI_RECOMMENDATION_STYLES.map((style) => {
            const Icon = STYLE_ICONS[style.id];
            const selected = styleValue === style.id;
            return (
              <button
                key={style.id}
                type="button"
                className={`air-style-card ${selected ? "is-selected" : ""}`}
                onClick={() => onStyleChange(style.id)}
                aria-pressed={selected}
              >
                <span className={`air-style-card__icon air-style-card__icon--${style.id}`}>
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span className="air-style-card__copy">
                  <strong>{style.label}</strong>
                  <small>{style.description}</small>
                </span>
                {style.id === "balanced" ? <span className="air-style-card__default">Default</span> : null}
                <span className="air-style-card__radio" aria-hidden="true">
                  {selected ? <Check size={13} /> : null}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </section>
  );
}
