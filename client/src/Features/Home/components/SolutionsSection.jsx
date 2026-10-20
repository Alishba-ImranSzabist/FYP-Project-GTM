import { useState } from "react";
import { BadgeCheck, Check } from "lucide-react";
import Button from "../../../Shared_Components/Button";
import Reveal from "../../../Shared_Components/Reveal";
import { ROUTES } from "../../../constants/routes";
import { SOLUTIONS } from "../data/homeContent";

export default function SolutionsSection() {
  const [active, setActive] = useState("business");
  const data = SOLUTIONS[active];

  return (
    <section className="section solutions" id="solutions">
      <div className="solutions__decor" aria-hidden="true" />
      <div className="container">
        <Reveal className="solutions__tabs" role="tablist" aria-label="Solutions">
          {Object.entries(SOLUTIONS).map(([key, s]) => (
            <button
              key={key}
              role="tab"
              aria-selected={active === key}
              className={`solutions__tab ${active === key ? "is-active" : ""}`}
              onClick={() => setActive(key)}
            >
              {s.label}
            </button>
          ))}
        </Reveal>

        <div className="solutions__grid" key={active}>
          <div className="solutions__visual">
            <div className="match-card">
              <p className="match-card__title">{data.listTitle}</p>
              <ul>
                {data.list.map((item) => (
                  <li key={item.name} className="match-row">
                    <span className="match-row__avatar">{item.initials}</span>
                    <div>
                      <strong>{item.name}</strong>
                      <small>
                        <BadgeCheck size={13} /> Verified opportunity
                      </small>
                    </div>
                    <span className="match-row__score">{item.match}% match</span>
                  </li>
                ))}
              </ul>
              <small className="match-card__sample">Sample data</small>
            </div>
            <div className="match-badge">
              <strong>{data.badge.value}</strong>
              <small>{data.badge.label}</small>
            </div>
          </div>

          <div className="solutions__copy">
            <span className="solutions__eyebrow">{data.eyebrow}</span>
            <h2>{data.title}</h2>
            <p>{data.text}</p>
            <ul className="solutions__points">
              {data.points.map((p) => (
                <li key={p}>
                  <span className="solutions__check">
                    <Check size={14} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <Button to={ROUTES.signup} variant="accent" arrow>
              Explore this solution
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
