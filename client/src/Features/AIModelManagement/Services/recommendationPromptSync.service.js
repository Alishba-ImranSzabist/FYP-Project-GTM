import { adminAIConfigDraftService } from "./adminAIConfigDraft.service.js";
import { createDefaultPromptForSection } from "../data/promptTemplates.js";

const EMPTY_PROMPT_DRAFT = { prompts: {} };

export const recommendationPromptSyncService = Object.freeze({
  addSection(section) {
    const current = adminAIConfigDraftService.read("prompt-settings", EMPTY_PROMPT_DRAFT);
    const prompts = { ...(current.prompts || {}) };
    if (!prompts[section.id]) {
      prompts[section.id] = section.defaultPrompt || createDefaultPromptForSection(section);
    }
    return adminAIConfigDraftService.save("prompt-settings", { ...current, prompts });
  },

  removeSection(sectionId) {
    const current = adminAIConfigDraftService.read("prompt-settings", EMPTY_PROMPT_DRAFT);
    const prompts = { ...(current.prompts || {}) };
    delete prompts[sectionId];
    return adminAIConfigDraftService.save("prompt-settings", { ...current, prompts });
  },

  syncSections(sections = []) {
    const current = adminAIConfigDraftService.read("prompt-settings", EMPTY_PROMPT_DRAFT);
    const allowedIds = new Set(["global", ...sections.map((section) => section.id)]);
    const prompts = Object.fromEntries(
      Object.entries(current.prompts || {}).filter(([promptId]) => allowedIds.has(promptId))
    );

    sections.forEach((section) => {
      if (!prompts[section.id]) {
        prompts[section.id] = section.defaultPrompt || createDefaultPromptForSection(section);
      }
    });

    return adminAIConfigDraftService.save("prompt-settings", { ...current, prompts });
  },
});
