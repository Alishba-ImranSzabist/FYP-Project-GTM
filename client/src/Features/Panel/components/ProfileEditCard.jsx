import { useRef, useState } from "react";
import { Building2, CheckCircle2, Mail, User } from "lucide-react";
import Button from "../../../Shared_Components/Button";
import FormField from "../../../Shared_Components/FormField";
import FormAlert from "../../Auth/components/FormAlert";
import useAuth from "../../Auth/Hooks/useAuth";
import useAuthForm from "../../Auth/Hooks/useAuthForm";
import { ROLE_PROFILE_CONFIG } from "../roleProfile";
import { profileService } from "../Services/profile.service";
import RoleProfileForm from "./RoleProfileForm";

/** Max edge of the uploaded photo — the canvas resize keeps the data URL small. */
const MAX_EDGE = 400;

const resizeToDataUrl = (src, cb) => {
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(img, 0, 0, w, h);
    cb(canvas.toDataURL("image/jpeg", 0.82));
  };
  img.onerror = () => cb(null);
  img.src = src;
};

/**
 * One unified edit form for the whole profile: account section (photo, name,
 * company, email) followed by the role-specific sections (business or service
 * provider — admin sees only the account part). A single Save updates the
 * account (PATCH /users/me) and the role profile (POST /profiles/me, idempotent).
 */
export default function ProfileEditCard({
  initialProfile = null,
  heading = "Edit profile",
  submitLabel = "Save profile",
  onCancel,
  onSaved,
}) {
  const { user, updateUser } = useAuth();
  const config = ROLE_PROFILE_CONFIG[user?.role];
  const fileRef = useRef(null);
  const initialAvatar = user?.avatar ?? null;
  const [avatar, setAvatar] = useState(initialAvatar);
  const [photoError, setPhotoError] = useState("");
  const [saved, setSaved] = useState(false);

  const initials = (user?.fullName || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const form = useAuthForm({
    initialValues: {
      fullName: user?.fullName || "",
      companyName: user?.companyName || "",
      ...(config ? config.fromProfile(initialProfile, { user }) : {}),
    },
    validate: (v) => {
      const e = {};
      if (v.fullName.trim().length < 2) e.fullName = "Enter your full name.";
      if (v.companyName.trim() && v.companyName.trim().length < 2)
        e.companyName = "Company name is too short.";
      if (config) Object.assign(e, config.validate(v));
      return e;
    },
    onSubmit: async (v) => {
      // 1) basic account (name / company / photo)
      const accountPayload = { fullName: v.fullName.trim() };
      if (v.companyName.trim()) accountPayload.companyName = v.companyName.trim();
      if (avatar !== initialAvatar) accountPayload.avatar = avatar; // null = remove photo
      const data = await profileService.updateProfile(accountPayload);
      updateUser(data.user);
      // 2) role-specific profile (idempotent save)
      let profile = initialProfile;
      if (config) {
        const roleData = await profileService.saveRoleProfile(config.toPayload(v));
        profile = roleData.profile;
      }
      setSaved(true);
      onSaved?.(profile);
    },
  });

  const clearSaved = (e) => {
    setSaved(false);
    form.handleChange(e);
  };
  const formProps = { ...form, handleChange: clearSaved };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!file) return;
    setSaved(false);
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image is too large — max 5 MB.");
      return;
    }
    setPhotoError("");
    const reader = new FileReader();
    reader.onload = () =>
      resizeToDataUrl(reader.result, (out) => {
        if (out) setAvatar(out);
        else setPhotoError("That image could not be read. Try another file.");
      });
    reader.readAsDataURL(file);
  };

  return (
    <section className="prof__card">
      <div className="prof__card-head">
        <div className="prof__card-head-text">
          <h2 className="prof__card-title">{heading}</h2>
          <p className="prof__card-intro">
            {config
              ? "Update your account details and everything below — one save updates your whole profile."
              : "Update your name, company and photo."}
          </p>
        </div>
      </div>

      <FormAlert message={form.formError} />
      {saved && !form.formError && (
        <p className="prof__ok" role="status">
          <CheckCircle2 size={16} aria-hidden="true" /> Profile saved — changes are stored in your
          account and will still be here after you log back in.
        </p>
      )}

      <form className="prof__form" onSubmit={form.handleSubmit} noValidate>
        <fieldset className="rpf__section" disabled={form.submitting}>
          <legend className="rpf__legend">Your account</legend>
          <p className="rpf__hint">Your name, company and photo appear across the workspace.</p>
          <div className="rpf__grid">
            <div className="rpf__cell rpf__cell--full">
              <div className="prof__photo">
                <span className="prof__avatar">
                  {avatar ? <img src={avatar} alt="Your profile" /> : initials}
                </span>
                <div className="prof__photo-actions">
                  <button
                    type="button"
                    className="prof__link"
                    onClick={() => fileRef.current?.click()}
                  >
                    Upload new photo
                  </button>
                  {avatar && (
                    <button
                      type="button"
                      className="prof__link prof__link--muted"
                      onClick={() => {
                        setAvatar(null);
                        setSaved(false);
                      }}
                    >
                      Remove
                    </button>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    hidden
                    onChange={onFile}
                  />
                  <small>JPG, PNG or WebP · resized to {MAX_EDGE}px automatically.</small>
                  {photoError && <small className="prof__error">{photoError}</small>}
                </div>
              </div>
            </div>
            <div className="rpf__cell">
              <FormField
                label="Full name"
                name="fullName"
                icon={User}
                autoComplete="name"
                value={form.values.fullName}
                onChange={clearSaved}
                error={form.errors.fullName}
                disabled={form.submitting}
              />
            </div>
            <div className="rpf__cell">
              <FormField
                label="Company name"
                name="companyName"
                icon={Building2}
                autoComplete="organization"
                placeholder="Northstar Growth"
                value={form.values.companyName}
                onChange={clearSaved}
                error={form.errors.companyName}
                disabled={form.submitting}
              />
            </div>
            <div className="rpf__cell rpf__cell--full">
              <FormField
                label="Work email"
                name="email"
                type="email"
                icon={Mail}
                value={user?.email || ""}
                readOnly
                hint="Contact support to change your login email."
              />
            </div>
          </div>
        </fieldset>

        {config && <RoleProfileForm config={config} form={formProps} />}

        <div className="prof__actions">
          <Button type="submit" variant="primary" arrow loading={form.submitting}>
            {submitLabel}
          </Button>
          {onCancel && (
            <button
              type="button"
              className="prof__cancel"
              onClick={onCancel}
              disabled={form.submitting}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

