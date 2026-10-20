import { Check, X } from "lucide-react";
import SectionHeading from "../../../Shared_Components/SectionHeading";
import Reveal from "../../../Shared_Components/Reveal";
import { WHY_AFTER, WHY_BEFORE } from "../data/homeContent";

export default function WhySection() {
  return (
    <section className="section why" id="why-gtm">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="Why GTM"
            title="Less busywork. More confident decisions."
            description="GTM replaces scattered tools and guesswork with one calm, accountable workflow."
          />
        </Reveal>

        <div className="why__grid">
          <Reveal className="why-card why-card--before">
            <h3>Without GTM</h3>
            <ul>
              {WHY_BEFORE.map((t) => (
                <li key={t}>
                  <span className="why-card__mark">
                    <X size={14} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="why-card why-card--after" delay={120}>
            <h3>With GTM</h3>
            <ul>
              {WHY_AFTER.map((t) => (
                <li key={t}>
                  <span className="why-card__mark">
                    <Check size={14} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
