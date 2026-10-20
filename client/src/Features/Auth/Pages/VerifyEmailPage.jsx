import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormAlert from "../components/FormAlert";
import Button from "../../../Shared_Components/Button";
import OtpInput from "../../../Shared_Components/OtpInput";
import { ROUTES } from "../../../constants/routes";
import useAuth from "../Hooks/useAuth";
import { authService } from "../Services/auth.service";

const RESEND_SECONDS = 60; // mirrors the server's OTP cooldown

export default function VerifyEmailPage() {
  const { user, loading, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = user?.email || location.state?.email || "";

  const [code, setCode] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  // resend countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleVerify = useCallback(
    async (e) => {
      e.preventDefault();
      if (code.length !== 6) {
        setFormError("Enter the 6-digit code from your email.");
        return;
      }
      setSubmitting(true);
      setFormError("");
      try {
        const data = await authService.verifyEmail({ email, code });
        updateUser(data.user); // store isEmailVerified: true in context
        navigate(ROUTES.dashboard, { replace: true });
      } catch (err) {
        setFormError(err.message || "Something went wrong.");
      } finally {
        setSubmitting(false);
      }
    },
    [code, email, updateUser, navigate],
  );

  const handleResend = useCallback(async () => {
    setFormError("");
    setNotice("");
    try {
      await authService.resendVerification({ email });
      setNotice("A new code is on its way. Check your inbox (and spam).");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setFormError(err.message || "Could not resend the code.");
    }
  }, [email]);

  if (loading) return null;
  // Not logged in (and no email passed) → login first
  if (!email) return <Navigate to={ROUTES.login} state={{ from: { pathname: ROUTES.verifyEmail } }} replace />;
  if (user?.isEmailVerified) return <Navigate to={ROUTES.dashboard} replace />;

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleVerify} noValidate>
        <header className="auth-form__head">
          <span className="auth-form__eyebrow">Verify your email</span>
          <h1>Check your inbox</h1>
          <p>
            We sent a 6-digit code to <strong>{email}</strong>. It expires in 10 minutes.
          </p>
        </header>

        <FormAlert message={formError} />
        <FormAlert message={notice} tone="success" />

        <OtpInput
          value={code}
          onChange={(v) => {
            setCode(v);
            setFormError("");
          }}
          error={formError && code.length !== 6 ? formError : ""}
          hint="Enter the 6-digit code we emailed you."
          autoFocus
        />

        <Button type="submit" size="lg" fullWidth arrow loading={submitting}>
          Verify email
        </Button>

        <div className="auth-form__row">
          <span className="auth-form__hint-text">
            Didn&rsquo;t get it? Check spam, or resend below.
          </span>
          <button type="button" className="link" onClick={handleResend} disabled={cooldown > 0}>
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </div>

        <p className="auth-form__switch">
          Wrong address? <Link to={ROUTES.signup}>Use a different email</Link>
        </p>
      </form>
    </AuthLayout>
  );
}