import { asyncHandler, sendSuccess } from "../../utils/response.js";
import * as serviceListings from "./serviceListing.service.js";

/** Controllers only translate HTTP <-> service calls. All logic lives in serviceListing.service.js. */

/** GET /api/service-listings — one page of my services. */
export const list = asyncHandler(async (req, res) => {
  sendSuccess(res, await serviceListings.listServices(req.user._id, req.query));
});

/** GET /api/service-listings/:id */
export const getOne = asyncHandler(async (req, res) => {
  sendSuccess(res, await serviceListings.getService(req.user._id, req.params.id));
});

/** POST /api/service-listings */
export const create = asyncHandler(async (req, res) => {
  const service = await serviceListings.createService(req.user._id, req.body);
  const message = service.status === "active" ? "Service saved. The AI is finding matches." : "Draft saved.";
  sendSuccess(res, { service }, message, 201);
});

/** PATCH /api/service-listings/:id */
export const update = asyncHandler(async (req, res) => {
  const service = await serviceListings.updateService(req.user._id, req.params.id, req.body);
  sendSuccess(res, { service }, service.status === "draft" ? "Draft saved." : "Service saved.");
});

/** PATCH /api/service-listings/:id/status */
export const changeStatus = asyncHandler(async (req, res) => {
  const service = await serviceListings.setServiceStatus(req.user._id, req.params.id, req.body.status);
  sendSuccess(res, { service }, service.status === "paused" ? "Matching paused." : "Matching resumed.");
});

/** DELETE /api/service-listings/:id */
export const remove = asyncHandler(async (req, res) => {
  await serviceListings.deleteService(req.user._id, req.params.id);
  sendSuccess(res, null, "Service deleted.");
});

/** POST /api/service-listings/:id/duplicate */
export const duplicate = asyncHandler(async (req, res) => {
  const service = await serviceListings.duplicateService(req.user._id, req.params.id);
  sendSuccess(res, { service }, "Service duplicated as a draft.", 201);
});
