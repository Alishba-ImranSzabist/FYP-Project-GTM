import { asyncHandler, sendSuccess } from "../../utils/response.js";
import * as campaignService from "./campaign.service.js";

/** Controllers only translate HTTP <-> service calls. All logic lives in campaign.service.js. */

/** GET /api/campaigns — one page of my campaigns + tab counts. */
export const list = asyncHandler(async (req, res) => {
  const result = await campaignService.listCampaigns(req.user._id, req.query);
  sendSuccess(res, result);
});

/** GET /api/campaigns/:id */
export const getOne = asyncHandler(async (req, res) => {
  const campaign = await campaignService.getCampaign(req.user._id, req.params.id);
  sendSuccess(res, { campaign });
});

/** POST /api/campaigns */
export const create = asyncHandler(async (req, res) => {
  const campaign = await campaignService.createCampaign(req.user._id, req.body);
  const message = campaign.status === "active" ? "Campaign launched." : "Draft saved.";
  sendSuccess(res, { campaign }, message, 201);
});

/** PATCH /api/campaigns/:id */
export const update = asyncHandler(async (req, res) => {
  const campaign = await campaignService.updateCampaign(req.user._id, req.params.id, req.body);
  const message = campaign.status === "active" ? "Campaign saved." : "Draft saved.";
  sendSuccess(res, { campaign }, message);
});

/** DELETE /api/campaigns/:id */
export const remove = asyncHandler(async (req, res) => {
  await campaignService.deleteCampaign(req.user._id, req.params.id);
  sendSuccess(res, null, "Campaign deleted.");
});

/** POST /api/campaigns/:id/duplicate */
export const duplicate = asyncHandler(async (req, res) => {
  const campaign = await campaignService.duplicateCampaign(req.user._id, req.params.id);
  sendSuccess(res, { campaign }, "Campaign duplicated as a draft.", 201);
});
