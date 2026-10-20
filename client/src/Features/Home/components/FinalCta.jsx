import { Sparkles } from "lucide-react";
import Button from "../../../Shared_Components/Button";
import Reveal from "../../../Shared_Components/Reveal";
import { ROUTES } from "../../../constants/routes";

export default function FinalCta() {
  return (
    <section className="final-cta">
      <div className="container">
        <Reveal className="final-cta__card">
          <span className="final-cta__icon">
            <Sparkles size={22} />
          </span>
          <span className="final-cta__eyebrow">Your next opportunity is already out there</span>
          <h2>Find it. Shape it. Grow with it.</h2>
          <p>Start building a smarter go-to-market motion today.</p>
          <Button to={ROUTES.signup} variant="light" size="lg" arrow>
            Get started for free
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
