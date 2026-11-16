import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormAlert from "../components/FormAlert";
import Button from "../../../Shared_Components/Button";
import OtpInput from "../../../Shared_Components/OtpInput";
import { ROUTES } from "../../../constants/routes";
import useAuth from "../Hooks/useAuth";
import { authService } from "../Services/auth.service";

const CORRECTION_URL = `${ROUTES.signup}?correct-email=1`;

export default function VerifyEmailPage() {
  const { user, loading, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = user?.email || "";

  const [code, setCode] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [resendDeadline, setResendDeadline] = useState(0);
  const [hasActiveCode, setHasActiveCode] = useState(true);
  const [now, setNow] = useState(Date.now());

  const secondsRemaining = Math.max(0, Math.ceil((resendDeadline - now) / 1000));

  const applyStatus = useCallback((status) => {
    const seconds = Math.max(0, Number(status?.resendAfterSeconds) || 0);
    setNow(Date.now());
    setResendDeadline(Date.now() + seconds * 1000);
    setHasActiveCode(Boolean(status?.hasActiveCode));
  }, []);

  // Read cooldown from MongoDB. Refreshes and page navigation never restart it.
  useEffect(() => {
    if (!email || user?.isEmailVerified) return;
    let active = true;
    setCheckingStatus(true);
    authService.verificationStatus()
      .then((status) => {
        if (!active) return;
        applyStatus(status);
        if (!status.hasActiveCode) setNotice("No active code yet. Choose Resend code to request one.");
      })
      .catch((err) => {
        if (!active) return;
        setFormError(err.message || "Could not check code status.");
      })
      .finally(() => { if (active) setCheckingStatus(false); });
    return () => { active = false; };
  }, [email, user?.isEmailVerified, applyStatus]);

  useEffect(() => {
    if (secondsRemaining === 0) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining > 0]);

  const handleVerify = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setFormError("Enter the 6-digit code from your email.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const data = await authService.verifyEmail({ email, code });
      updateUser(data.user);
      navigate(ROUTES.dashboard, { replace: true });
    } catch (err) {
      setFormError(err.message || "Could not verify your email.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (checkingStatus || secondsRemaining > 0 || resending) return;
    setResending(true);
    setFormError("");
    setNotice("");
    try {
      const status = await authService.resendVerification();
      applyStatus(status);
      setNotice("A new code was sent. Check your inbox and spam folder.");
    } catch (err) {
      setFormError(err.message || "Could not send another code.");
      // If the server says 429, refresh the real remaining cooldown.
      try { applyStatus(await authService.verificationStatus()); } catch { /* show original error */ }
    } finally {
      setResending(false);
    }
  };

  if (loading) return null;
  if (!user) return <Navigate to={ROUTES.login} replace />;
  if (user.isEmailVerified) return <Navigate to={ROUTES.dashboard} replace />;

  const initialDeliveryFailed = location.state?.deliveryFailed === true;
  const showDeliveryWarning = initialDeliveryFailed && !notice && !formError && !hasActiveCode;

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleVerify} noValidate>
        <header className="auth-form__head">
          <span className="auth-form__eyebrow">Verify your email</span>
          <h1>Check your inbox</h1>
          <p>
            We sent a 6-digit code to <strong>{email}</strong>. Codes expire in 10 minutes.
          </p>
        </header>

        <FormAlert message={formError} />
        <FormAlert message={showDeliveryWarning ? "Email could not be sent. Try Resend code." : ""} />
        <FormAlert message={notice} tone={hasActiveCode ? "success" : "error"} />

        <OtpInput
          value={code}
          onChange={(value) => { setCode(value); setFormError(""); }}
          error={formError && code.length !== 6 ? formError : ""}
          hint="Enter the 6-digit code we emailed you."
          autoFocus
        />

        <Button type="submit" size="lg" fullWidth arrow loading={submitting}>
          Verify email
        </Button>

        <div className="auth-form__row">
          <span className="auth-form__hint-text">Didn't get it? Check spam, or resend below.</span>
          <button
            type="button"
            className="link"
            onClick={handleResend}
            disabled={checkingStatus || resending || secondsRemaining > 0}
          >
            {checkingStatus ? "Checking..." : resending ? "Sending..." : secondsRemaining > 0
              ? `Resend in ${secondsRemaining}s` : "Resend code"}
          </button>
        </div>

        <p className="auth-form__switch">
          Wrong address? <Link className="link" to={CORRECTION_URL}>Use a different email</Link>
        </p>
      </form>
    </AuthLayout>
  );
}