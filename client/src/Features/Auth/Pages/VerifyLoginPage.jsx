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

/**
 * Step 2 of login from an unknown device: the password was correct, but the
 * server wants a 6-digit code from the email before opening the session.
 */
export default function VerifyLoginPage() {
  const { user, loading, verifyLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

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
        const loggedIn = await verifyLogin({ email, code });
        // unverified accounts still owe us the signup code
        navigate(loggedIn.isEmailVerified ? ROUTES.dashboard : ROUTES.verifyEmail, { replace: true });
      } catch (err) {
        setFormError(err.message || "Something went wrong.");
      } finally {
        setSubmitting(false);
      }
    },
    [code, email, verifyLogin, navigate],
  );

  const handleResend = useCallback(async () => {
    setFormError("");
    setNotice("");
    try {
      await authService.resendLoginCode({ email });
      setNotice("A new code is on its way. Check your inbox (and spam).");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setFormError(err.message || "Could not resend the code.");
    }
  }, [email]);

  if (loading) return null;
  if (!email) return <Navigate to={ROUTES.login} replace />; // refreshed / direct URL visit
  if (user) return <Navigate to={user.isEmailVerified ? ROUTES.dashboard : ROUTES.verifyEmail} replace />;

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleVerify} noValidate>
        <header className="auth-form__head">
          <span className="auth-form__eyebrow">Security check</span>
          <h1>Confirm it&rsquo;s you</h1>
          <p>
            You&rsquo;re signing in from a new device. We sent a 6-digit code to{" "}
            <strong>{email}</strong> — it expires in 10 minutes.
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
          autoFocus
        />

        <Button type="submit" size="lg" fullWidth arrow loading={submitting}>
          Confirm &amp; log in
        </Button>

        <div className="auth-form__row">
          <span className="auth-form__hint-text">Check spam, or resend below.</span>
          <button type="button" className="link" onClick={handleResend} disabled={cooldown > 0}>
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </div>

        <p className="auth-form__switch">
          Not you? <Link to={ROUTES.login}>Log in with another account</Link>
        </p>
      </form>
    </AuthLayout>
  );
}