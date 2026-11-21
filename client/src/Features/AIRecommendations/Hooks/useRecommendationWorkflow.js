import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { campaignService } from "../../Campaigns/Services/campaign.service";
import { AI_RECOMMENDATION_LIMITS, AI_RECOMMENDATION_STYLES, DEFAULT_RECOMMENDATION_STYLE } from "../recommendationSettings.js";
import { getRecommendationReadiness } from "../recommendationValidation.js";
import { recommendationApiService } from "../Services/recommendationApi.service.js";

/**
 * Owns campaign loading, model selection, generation and review state.
 * The page and child components only render the state/actions returned here.
 */
export default function useRecommendationWorkflow() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [model, setModel] = useState("fast");
  const [recommendationStyle, setRecommendationStyle] = useState(DEFAULT_RECOMMENDATION_STYLE);
  const [recommendation, setRecommendation] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("pending");
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const latestGeneration = useRef(0);

  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === selectedCampaignId) || null,
    [campaigns, selectedCampaignId]
  );

  const readiness = useMemo(
    () => getRecommendationReadiness(selectedCampaign),
    [selectedCampaign]
  );

  const loadCampaigns = useCallback(async () => {
    setCampaignsLoading(true);
    setError("");

    try {
      const data = await campaignService.list({
        page: 1,
        limit: AI_RECOMMENDATION_LIMITS.campaignsPerRequest,
      });
      const items = Array.isArray(data?.campaigns) ? data.campaigns : [];
      setCampaigns(items);
      setSelectedCampaignId((current) => {
        if (current && items.some((campaign) => campaign.id === current)) return current;
        const available = items.find((campaign) => campaign.status !== "completed") || items[0];
        return available?.id || "";
      });
    } catch (err) {
      setError(err.message || "Unable to load your campaigns.");
    } finally {
      setCampaignsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const selectCampaign = useCallback((campaignId) => {
    latestGeneration.current += 1;
    setSelectedCampaignId(campaignId);
    setRecommendation(null);
    setReviewStatus("pending");
    setError("");
    setNotice("");
    setGenerating(false);
  }, []);

  const selectModel = useCallback((nextModel) => {
    setModel(nextModel);
    setNotice("");
  }, []);

  const selectRecommendationStyle = useCallback((nextStyle) => {
    const isValidStyle = AI_RECOMMENDATION_STYLES.some((style) => style.id === nextStyle);
    if (!isValidStyle) return;
    setRecommendationStyle(nextStyle);
    setNotice("");
  }, []);

  const generate = useCallback(async () => {
    if (!selectedCampaign) {
      setError("Choose a campaign before generating recommendations.");
      return false;
    }

    const campaignReadiness = getRecommendationReadiness(selectedCampaign);
    if (!campaignReadiness.isReady) {
      setError(`Complete these campaign details first: ${campaignReadiness.missingFields.join(", ")}.`);
      return false;
    }

    const requestId = ++latestGeneration.current;
    setGenerating(true);
    setReviewStatus("pending");
    setError("");
    setNotice("");

    try {
      const data = await recommendationApiService.generate({ campaign: selectedCampaign, model, recommendationStyle });
      if (requestId !== latestGeneration.current) return false;
      if (!data?.recommendation?.sections?.length) {
        throw new Error("The recommendation response was incomplete. Please try again.");
      }
      setRecommendation(data.recommendation);
      setReviewStatus(data.recommendation.reviewStatus || data.recommendation.status || "pending");
      return true;
    } catch (err) {
      if (requestId === latestGeneration.current) {
        setError(err.message || "Recommendations could not be generated. Please try again.");
      }
      return false;
    } finally {
      if (requestId === latestGeneration.current) setGenerating(false);
    }
  }, [model, recommendationStyle, selectedCampaign]);

  const changeModel = useCallback(() => {
    latestGeneration.current += 1;
    setRecommendation(null);
    setReviewStatus("pending");
    setError("");
    setNotice("");
  }, []);

  const saveDraft = useCallback(async () => {
    if (!recommendation?.id) return false;
    setError("");
    setNotice("");
    try {
      const data = await recommendationApiService.saveDraft(recommendation.id);
      const updated = data?.recommendation;
      if (updated) setRecommendation(updated);
      setReviewStatus(updated?.reviewStatus || updated?.status || "draft");
      setNotice("Recommendation draft saved to your account.");
      return true;
    } catch (err) {
      setError(err.message || "The recommendation draft could not be saved.");
      return false;
    }
  }, [recommendation]);

  const approve = useCallback(async () => {
    if (!recommendation?.id) return false;
    setError("");
    setNotice("");
    try {
      const data = await recommendationApiService.approve(recommendation.id);
      const updated = data?.recommendation;
      if (updated) setRecommendation(updated);
      setReviewStatus(updated?.reviewStatus || updated?.status || "approved");
      setNotice("Recommendation approved and saved. No campaign has been launched and no leads or messages have been sent.");
      return true;
    } catch (err) {
      setError(err.message || "The recommendation could not be approved.");
      return false;
    }
  }, [recommendation]);

  const refreshCampaigns = useCallback(() => loadCampaigns(), [loadCampaigns]);

  return {
    campaigns,
    selectedCampaign,
    selectedCampaignId,
    model,
    recommendationStyle,
    recommendation,
    reviewStatus,
    readiness,
    campaignsLoading,
    generating,
    error,
    notice,
    selectCampaign,
    selectModel,
    selectRecommendationStyle,
    generate,
    changeModel,
    saveDraft,
    approve,
    refreshCampaigns,
    canGenerate: Boolean(selectedCampaign && readiness.isReady && !generating),
  };
}
