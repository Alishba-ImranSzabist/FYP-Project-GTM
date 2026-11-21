import { asyncHandler, sendSuccess } from "../../../../utils/response.js";
import * as exampleAdminService from "../../services/admin/campaignExampleAdmin.service.js";

export const list = asyncHandler(async (req, res) => {
  const result = await exampleAdminService.listCampaignExamples(req.query);
  sendSuccess(res, result);
});

export const review = asyncHandler(async (req, res) => {
  const result = await exampleAdminService.reviewCampaignExample(
    req.user._id,
    req.params.id,
    req.body
  );
  sendSuccess(res, { example: result }, "Campaign example review saved.");
});
