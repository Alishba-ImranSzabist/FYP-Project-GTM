import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function FormAlert({ message, tone = "error" }) {
  if (!message) return null;
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div className={`form-alert ${tone === "success" ? "form-alert--success" : ""}`} role="alert">
      <Icon size={18} />
      <span>{message}</span>
    </div>
  );
}
