import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Circle, Plane } from "lucide-react";
import { Navigate } from "react-router-dom";
import BrandMark from "../../../Shared_Components/BrandMark";
import Button from "../../../Shared_Components/Button";
import { ROUTES } from "../../../constants/routes";
import useAuth from "../../Auth/Hooks/useAuth";
import { ROLE_PROFILE_CONFIG } from "../roleProfile";
import { profileService } from "../Services/profile.service";
import ProfileEditCard from "../components/ProfileEditCard";
import "../../Auth/Auth.css";
import "../Panel.css";

/**
 * First-run profile setup (business & service_provider only — admin is sent
 * back to the panel). One progress card + ONE unified form (account + role
 * sections) so the user sets everything up in a single place.
 */
export default function ProfileSetupPage() {
  const { user, loading } = useAuth();
  const [roleProfile, setRoleProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savedOnce, setSavedOnce] = useState(false);

  const config = user ? ROLE_PROFILE_CONFIG[user.role] : undefined;

  useEffect(() => {
    if (!config) {
      setLoadingProfile(false);
      return undefined;
    }
    let active = true;
    profileService
      .getRoleProfile()
      .then((data) => active && setRoleProfile(data.profile ?? null))
      .catch(() => {})
      .finally(() => active && setLoadingProfile(false));
    return () => {
      active = false;
    };
  }, [config]);

  if (loading) return null;
  if (!user) return <Navigate to={ROUTES.login} replace />;
  if (!config) return <Navigate to={ROUTES.dashboard} replace />;

  const roleCompletion = config.profileCompletion(roleProfile);
  const steps = [
    { label: "Account details", done: Boolean(user.fullName && user.email) },
    { label: "Profile photo", done: Boolean(user.avatar), optional: true },
    { label: config.editTitle, done: roleCompletion.done === roleCompletion.total },
  ];
  const percent = Math.round((steps.filter((s) => s.done).length / steps.length) * 100);

  return (
    <div className="prof">
      <header className="prof__bar">
        <div className="container prof__bar-inner">
          <BrandMark />
          <Button variant="ghost" size="sm" icon={ArrowLeft} to={ROUTES.dashboard}>
            Back to panel
          </Button>
        </div>
      </header>

      <main className="container prof__main prof__main--wide">
        <div className="prof__head">
          <span className="prof__eyebrow">Profile setup</span>
          <h1>Set up your profile</h1>
          <p>
            A few details about you and your {config.roleLabel.toLowerCase()} account — these help
            the platform match, recommend and represent you better. You can change everything later.
          </p>
        </div>

        <section className="prof__card prof__progress" aria-label="Setup progress">
          <div className="prof__progress-top">
            <div className="prof__card-head-text">
              <h2 className="prof__card-title">Profile completion</h2>
              <p className="prof__card-intro">
                Finish these steps so the platform can do its best work for you.
              </p>
            </div>
            <span className="prof__percent">{percent}%</span>
          </div>
          <div
            className="prof__bar-track"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Profile completion"
          >
            <span className="prof__bar-fill" style={{ width: `${percent}%` }} />
          </div>
          <ul className="prof__steps">
            {steps.map((step) => (
              <li key={step.label} className={`prof__step ${step.done ? "is-done" : ""}`}>
                {step.done ? (
                  <CheckCircle2 size={17} aria-hidden="true" />
                ) : (
                  <Circle size={17} aria-hidden="true" />
                )}
                <span>
                  {step.label}
                  {step.optional && <small> · optional</small>}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {loadingProfile ? (
          <section className="prof__card" aria-busy="true" aria-label="Loading your profile">
            <span className="prof__skeleton prof__skeleton--title" />
            <span className="prof__skeleton" />
            <span className="prof__skeleton prof__skeleton--short" />
            <span className="prof__skeleton" />
          </section>
        ) : (
          <ProfileEditCard
            initialProfile={roleProfile}
            heading="Your details"
            submitLabel="Save profile"
            onSaved={(p) => {
              setRoleProfile(p);
              setSavedOnce(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {savedOnce && (
          <div className="prof__setup-cta">
            <Button variant="primary" size="lg" arrow icon={Plane} to={ROUTES.dashboard}>
              Go to my dashboard
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

