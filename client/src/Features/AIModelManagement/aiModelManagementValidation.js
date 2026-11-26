const hasText = (value) => typeof value === "string" && value.trim().length > 0;
const asNumber = (value) => Number(value);

export function validateProviderConfiguration(values, apiKey) {
  const errors = {};

  if (!values.provider) errors.provider = "Select an AI provider.";
  if (!hasText(apiKey)) errors.apiKey = "Enter the provider API key.";
  if (!hasText(values.baseUrl)) {
    errors.baseUrl = "Base URL is required.";
  } else {
    try {
      const parsed = new URL(values.baseUrl.trim());
      if (parsed.protocol !== "https:") errors.baseUrl = "Use a secure HTTPS endpoint.";
    } catch {
      errors.baseUrl = "Enter a valid URL.";
    }
  }

  if (!hasText(values.modelId)) errors.modelId = "Model ID is required.";

  ["dailyQuota", "hourlyQuota"].forEach((field) => {
    const value = asNumber(values[field]);
    if (!Number.isInteger(value) || value < 1 || value > 1000000) {
      errors[field] = "Enter a whole number between 1 and 1,000,000.";
    }
  });

  return errors;
}

export function validateModelConfiguration(values) {
  const errors = {};

  ["fast"].forEach((profile) => {
    const model = values[profile] || {};
    if (!model.provider) errors[`${profile}.provider`] = "Select a provider.";
    if (!hasText(model.modelId)) errors[`${profile}.modelId`] = "Model ID is required.";

    const maxTokens = asNumber(model.maxTokens);
    if (!Number.isInteger(maxTokens) || maxTokens < 256 || maxTokens > 100000) {
      errors[`${profile}.maxTokens`] = "Enter a whole number between 256 and 100,000.";
    }

    const timeout = asNumber(model.timeoutSeconds);
    if (!Number.isInteger(timeout) || timeout < 10 || timeout > 600) {
      errors[`${profile}.timeoutSeconds`] = "Timeout must be between 10 and 600 seconds.";
    }
  });

  const retries = asNumber(values.retryAttempts);
  if (!Number.isInteger(retries) || retries < 0 || retries > 5) {
    errors.retryAttempts = "Retry attempts must be between 0 and 5.";
  }

  if (values.fallbackModel !== "fast") {
    errors.fallbackModel = "Choose a valid fallback model.";
  }

  return errors;
}

export function validatePromptText(value) {
  const text = String(value || "").trim();
  if (!text) return "Please enter a prompt before saving.";
  if (text.length > 8000) return "Prompt cannot exceed 8,000 characters.";
  return "";
}

export function validateRecommendationConfiguration(values) {
  const errors = {};
  const sections = Array.isArray(values.sections) ? values.sections : [];
  const enabledCount = sections.filter((section) => values.enabledSections?.[section.id] !== false).length;

  if (sections.length === 0) errors.sections = "Keep at least one recommendation section.";
  if (sections.length > 12) errors.sections = "You can configure up to 12 recommendation sections.";
  if (enabledCount === 0) errors.enabledSections = "Enable at least one recommendation category.";

  const ids = sections.map((section) => section.id);
  if (new Set(ids).size !== ids.length) errors.sections = "Recommendation section IDs must be unique.";

  const rules = [
    ["minimumConfidence", 0, 100, "Minimum recommendation match score must be between 0 and 100."],
    ["maxAudienceSegments", 1, 10, "Audience segments must be between 1 and 10."],
    ["maxChannels", 1, 10, "Channels must be between 1 and 10."],
    ["maxKeywords", 1, 50, "Keywords must be between 1 and 50."],
  ];

  rules.forEach(([field, min, max, message]) => {
    const value = asNumber(values[field]);
    if (!Number.isInteger(value) || value < min || value > max) errors[field] = message;
  });

  return errors;
}


export function validateRecommendationSection(section, existingSections = []) {
  const errors = {};
  const title = String(section?.title || "").trim();
  const description = String(section?.description || "").trim();

  if (title.length < 3) errors.title = "Enter a section name with at least 3 characters.";
  if (title.length > 80) errors.title = "Section name cannot exceed 80 characters.";
  if (description.length < 10) errors.description = "Enter a short description (at least 10 characters).";
  if (description.length > 240) errors.description = "Description cannot exceed 240 characters.";

  const duplicate = existingSections.some(
    (item) => String(item.title || "").trim().toLowerCase() === title.toLowerCase()
  );
  if (title && duplicate) errors.title = "A recommendation section with this name already exists.";

  return errors;
}
