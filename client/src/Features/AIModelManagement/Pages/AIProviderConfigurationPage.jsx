import AIModelManagementLayout from "../components/AIModelManagementLayout";
import ConfigPageHeader from "../components/ConfigPageHeader";
import ActiveModelSettings from "./AIModelConfigurationPage";

export default function AIProviderConfigurationPage() {
  return (
    <AIModelManagementLayout>
      <ConfigPageHeader
        title="AI Provider Configuration"
        description="Google Gemini uses the API credentials and model settings configured on the server."
      />
      <ActiveModelSettings />
    </AIModelManagementLayout>
  );
}
