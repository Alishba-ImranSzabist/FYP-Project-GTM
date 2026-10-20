import SectionHeading from "../../../Shared_Components/SectionHeading";
import Reveal from "../../../Shared_Components/Reveal";
import { PLATFORM_FEATURES } from "../data/homeContent";

export default function PlatformSection() {
  return (
    <section className="section platform" id="platform">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="One connected platform"
            title="Everything you need to go from signal to sale."
            description="Stop switching between disconnected tools. GTM gives you one clear, human-led path to growth."
          />
        </Reveal>

        <div className="platform__grid">
          {PLATFORM_FEATURES.map(({ icon: Icon, title, text, metric, metricLabel }, i) => (
            <Reveal key={title} delay={i * 90} className="feature-card">
              <span className="feature-card__num">0{i + 1}</span>
              <span className="feature-card__icon">
                <Icon size={22} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
              <div className="feature-card__metric">
                <strong>{metric}</strong>
                <small>{metricLabel}</small>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
