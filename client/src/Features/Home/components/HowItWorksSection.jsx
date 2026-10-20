import SectionHeading from "../../../Shared_Components/SectionHeading";
import Reveal from "../../../Shared_Components/Reveal";
import { STEPS } from "../data/homeContent";

export default function HowItWorksSection() {
  return (
    <section className="section how" id="how-it-works">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="AI moves fast. You make the call."
            description="Four simple steps from idea to measurable growth, with you in the driver's seat the whole way."
          />
        </Reveal>

        <ol className="how__steps">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <Reveal as="li" key={title} delay={i * 110} className="step">
              <span className="step__icon">
                <Icon size={24} />
                <b>{i + 1}</b>
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
