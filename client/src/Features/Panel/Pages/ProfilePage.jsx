import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Building2, CheckCircle2, Mail, User } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import BrandMark from "../../../Shared_Components/BrandMark";
import Button from "../../../Shared_Components/Button";
import FormField from "../../../Shared_Components/FormField";
import { ROUTES } from "../../../constants/routes";
import useAuth from "../../Auth/Hooks/useAuth";
import useAuthForm from "../../Auth/Hooks/useAuthForm";
import FormAlert from "../../Auth/components/FormAlert";
import { profileService } from "../Services/profile.service";
import "../Panel.css";

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

/** Account settings: edit name / company and upload a profile photo. */
export default function ProfilePage() {
  const { user, loading, updateUser } = useAuth();
  const fileRef = useRef(null);
  const [avatar, setAvatar] = useState(null);
  const [saved, setSaved] = useState(false);
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    if (user) setAvatar(user.avatar ?? null);
  }, [user]);

  const initials = (user?.fullName || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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

  const form = useAuthForm({
    initialValues: { fullName: user?.fullName || "", companyName: user?.companyName || "" },
    validate: (v) => {
      const e = {};
      if (v.fullName.trim().length < 2) e.fullName = "Enter your full name.";
      if (v.companyName.trim() && v.companyName.trim().length < 2)
        e.companyName = "Company name is too short.";
      return e;
    },
    onSubmit: async (v) => {
      const payload = { fullName: v.fullName.trim() };
      if (v.companyName.trim()) payload.companyName = v.companyName.trim();
      if (avatar !== (user.avatar ?? null)) payload.avatar = avatar; // null = remove photo
      const data = await profileService.updateProfile(payload);
      updateUser(data.user);
      setSaved(true);
    },
  });

  if (loading) return null;
  if (!user) return <Navigate to={ROUTES.login} replace />;

  const clearSaved = (e) => {
    setSaved(false);
    form.handleChange(e);
  };

  return (
    <div className="page prof">
      <header className="prof__bar">
        <div className="container prof__bar-inner">
          <BrandMark />
          <Button variant="ghost" size="sm" icon={ArrowLeft} to={ROUTES.dashboard}>
            Back to panel
          </Button>
        </div>
      </header>

      <main className="container prof__main">
        <div className="prof__head">
          <span className="prof__eyebrow">Account settings</span>
          <h1>Your profile</h1>
          <p>Update your details and photo. This is how your account appears across the workspace.</p>
        </div>

        <section className="prof__card">
          <div className="prof__photo">
            <span className="prof__avatar">
              {avatar ? <img src={avatar} alt="Your profile" /> : initials}
            </span>
            <div className="prof__photo-actions">
              <button type="button" className="prof__link" onClick={() => fileRef.current?.click()}>
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

          <FormAlert message={form.formError} />
          {saved && !form.formError && (
            <p className="prof__ok">
              <CheckCircle2 size={16} aria-hidden="true" /> Profile updated.
            </p>
          )}

          <form className="prof__form" onSubmit={form.handleSubmit} noValidate>
            <FormField
              label="Full name"
              name="fullName"
              icon={User}
              autoComplete="name"
              value={form.values.fullName}
              onChange={clearSaved}
              error={form.errors.fullName}
            />
            <FormField
              label="Company name"
              name="companyName"
              icon={Building2}
              autoComplete="organization"
              placeholder="Northstar Growth"
              value={form.values.companyName}
              onChange={clearSaved}
              error={form.errors.companyName}
            />
            <FormField
              label="Work email"
              name="email"
              type="email"
              icon={Mail}
              value={user.email}
              readOnly
              hint="Contact support to change your login email."
            />

            <div className="prof__actions">
              <Button type="submit" variant="primary" arrow loading={form.submitting}>
                Save changes
              </Button>
              <Link className="prof__cancel" to={ROUTES.dashboard}>
                Cancel
              </Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}