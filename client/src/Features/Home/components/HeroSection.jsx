import { Check, Play, Sparkles } from "lucide-react";
import Button from "../../../Shared_Components/Button";
import { ROUTES } from "../../../constants/routes";
import { HERO_TRUST } from "../data/homeContent";
import DashboardPreview from "./DashboardPreview";

export default function HeroSection() {
  return (
    <section className="hero" id="top">
      <div className="hero__bg" aria-hidden="true" />
      <div className="container hero__inner">
        <div className="hero__copy">
          <span className="pill">
            <Sparkles size={14} /> AI-powered. Human-approved.
          </span>

          <h1 className="hero__title">
            Make every move to market <span className="hero__em">smarter.</span>
          </h1>

          <p className="hero__lead">
            Discover the right leads, build campaigns and turn opportunity into measurable growth,
            with AI doing the heavy lifting and you making every decision.
          </p>

          <div className="hero__cta">
            <Button to={ROUTES.signup} size="lg" arrow>
              Start growing today
            </Button>
            <Button href="#how-it-works" variant="ghost" size="lg" icon={Play}>
              See how it works
            </Button>
          </div>

          <ul className="hero__trust">
            {HERO_TRUST.map((t) => (
              <li key={t}>
                <Check size={16} /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero__visual">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
