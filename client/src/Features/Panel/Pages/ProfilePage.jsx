import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Circle,
  Mail,
  Pencil,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Navigate } from "react-router-dom";
import BrandMark from "../../../Shared_Components/BrandMark";
import Button from "../../../Shared_Components/Button";
import FormAlert from "../../Auth/components/FormAlert";
import { ROUTES } from "../../../constants/routes";
import useAuth from "../../Auth/Hooks/useAuth";
import { ROLE_PROFILE_CONFIG } from "../roleProfile";
import { profileService } from "../Services/profile.service";
import ProfileEditCard from "../components/ProfileEditCard";
import "../../Auth/Auth.css";
import "../Panel.css";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "—";

function SkeletonCard({ label }) {
  return (
    <section className="prof__card" aria-busy="true" aria-label={label}>
      <span className="prof__skeleton prof__skeleton--title" />
      <span className="prof__skeleton" />
      <span className="prof__skeleton prof__skeleton--short" />
      <span className="prof__skeleton" />
    </section>
  );
}

/**
 * The logged-in user's profile page.
 *  - View mode: identity card + role profile summary (business / provider) +
 *    completion + account facts sidebar.
 *  - Edit mode: ONE unified form (ProfileEditCard) with account + role fields.
 * Admin keeps the existing account-only behaviour (no role sections).
 */
export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [roleProfile, setRoleProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [editing, setEditing] = useState(false);

  const config = user ? ROLE_PROFILE_CONFIG[user.role] : undefined;

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    setProfileError("");
    try {
      const data = await profileService.getRoleProfile();
      setRoleProfile(data.profile ?? null);
    } catch (err) {
      setProfileError(err.message || "Could not load your profile.");
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (config) loadProfile();
    else setLoadingProfile(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return null;
  if (!user) return <Navigate to={ROUTES.login} replace />;

  const initials = (user.fullName || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const completion = config ? config.profileCompletion(roleProfile) : null;
  const roleDone = Boolean(completion && completion.done === completion.total);
  const steps = config
    ? [
        { label: "Account details", done: Boolean(user.fullName && user.email) },
        { label: "Profile photo", done: Boolean(user.avatar) },
        { label: config.editTitle, done: roleDone },
      ]
    : [];
  const percent = steps.length
    ? Math.round((steps.filter((s) => s.done).length / steps.length) * 100)
    : 0;

  const factsCard = (
    <section className="prof__card">
      <h2 className="prof__card-title">Account details</h2>
      <ul className="prof__facts">
        <li>
          <span>Role</span>
          <strong>{config ? config.roleLabel : "Admin"}</strong>
        </li>
        <li>
          <span>Work email</span>
          <strong>{user.email}</strong>
        </li>
        {user.companyName && (
          <li>
            <span>Company</span>
            <strong>{user.companyName}</strong>
          </li>
        )}
        <li>
          <span>Email status</span>
          <strong className={user.isEmailVerified ? "prof__verified" : ""}>
            {user.isEmailVerified ? (
              <>
                <ShieldCheck size={14} aria-hidden="true" /> Verified
              </>
            ) : (
              "Pending"
            )}
          </strong>
        </li>
        <li>
          <span>Member since</span>
          <strong>{formatDate(user.createdAt)}</strong>
        </li>
      </ul>
    </section>
  );

  /** Read-only role profile summary (screenshot-style "About" card). */
  const roleSummaryCard = !config ? null : roleProfile ? (
    <section className="prof__card">
      <h2 className="prof__card-title">{config.viewTitle}</h2>
      <dl className="prof__summary">
        {config.summary(roleProfile).map((item) => (
          <div
            key={item.label}
            className={`prof__summary-item ${item.wide ? "prof__summary-item--wide" : ""}`}
          >
            <dt>{item.label}</dt>
            <dd>
              {item.kind === "chips" ? (
                item.value.length ? (
                  <ul className="chips chips--view">
                    {item.value.map((skill) => (
                      <li key={skill} className="chip chip--view">
                        {skill}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <em className="prof__empty-text">Not added yet</em>
                )
              ) : item.kind === "links" ? (
                item.value.length ? (
                  <ul className="prof__links">
                    {item.value.map((link) => (
                      <li key={link}>
                        <a href={link} target="_blank" rel="noreferrer noopener">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <em className="prof__empty-text">Not added yet</em>
                )
              ) : item.value?.trim() ? (
                item.value
              ) : (
                <em className="prof__empty-text">Not added yet</em>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  ) : (
    <section className="prof__card prof__empty">
      <span className="prof__empty-icon">
        <Sparkles size={24} aria-hidden="true" />
      </span>
      <h2 className="prof__card-title">Set up your {config.roleLabel.toLowerCase()} profile</h2>
      <p className="prof__card-intro">
        Add your details so the platform can match, recommend and represent you better.
      </p>
      <Button variant="primary" arrow to={ROUTES.profileSetup}>
        Set up now
      </Button>
    </section>
  );

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
          <span className="prof__eyebrow">Profile</span>
          <h1>Your profile</h1>
          <p>Manage how you appear across the workspace and keep your details up to date.</p>
        </div>

        <section className="prof__card prof__id" aria-label="Your account">
          <span className="prof__avatar prof__avatar--lg">
            {user.avatar ? <img src={user.avatar} alt={`${user.fullName}'s profile`} /> : initials}
          </span>
          <div className="prof__id-text">
            <h2>{user.fullName}</h2>
            <div className="prof__id-meta">
              <span className="prof__chip prof__chip--role">
                {config ? config.roleLabel : "Admin"}
              </span>
              {user.companyName && (
                <span className="prof__chip">
                  <Building2 size={13} aria-hidden="true" />
                  {user.companyName}
                </span>
              )}
              <span className="prof__chip">
                <Mail size={13} aria-hidden="true" />
                {user.email}
              </span>
            </div>
          </div>
          {!editing && (
            <div className="prof__id-actions">
              <Button variant="primary" size="sm" icon={Pencil} onClick={() => setEditing(true)}>
                Edit profile
              </Button>
            </div>
          )}
        </section>

        {config ? (
          <div className="prof__layout">
            <div className="prof__layout-main">
              {editing ? (
                <ProfileEditCard
                  initialProfile={roleProfile}
                  onCancel={() => setEditing(false)}
                  onSaved={(p) => {
                    setRoleProfile(p);
                    setEditing(false);
                  }}
                />
              ) : loadingProfile ? (
                <SkeletonCard label="Loading your profile" />
              ) : profileError ? (
                <section className="prof__card">
                  <h2 className="prof__card-title">{config.editTitle}</h2>
                  <FormAlert message={profileError} />
                  <div className="prof__actions">
                    <Button variant="outline" size="sm" onClick={loadProfile}>
                      Try again
                    </Button>
                  </div>
                </section>
              ) : (
                roleSummaryCard
              )}
            </div>

            <aside className="prof__layout-side" aria-label="Profile overview">
              {!editing && (
                <section className="prof__card">
                  <h2 className="prof__card-title">Profile completion</h2>
                  <div className="prof__progress-top prof__progress-top--compact">
                    <span className="prof__percent prof__percent--sm">{percent}%</span>
                    <p className="prof__card-intro">
                      {roleDone
                        ? "Your profile is complete — nice work!"
                        : "Finish the remaining steps for better matches."}
                    </p>
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
                        <span>{step.label}</span>
                      </li>
                    ))}
                  </ul>
                  {!roleDone && (
                    <div className="prof__actions">
                      <Button variant="outline" size="sm" arrow to={ROUTES.profileSetup}>
                        Finish setup
                      </Button>
                    </div>
                  )}
                </section>
              )}
              {factsCard}
            </aside>
          </div>
        ) : editing ? (
          <ProfileEditCard
            initialProfile={null}
            onCancel={() => setEditing(false)}
            onSaved={() => setEditing(false)}
          />
        ) : (
          factsCard
        )}
      </main>
    </div>
  );
}


