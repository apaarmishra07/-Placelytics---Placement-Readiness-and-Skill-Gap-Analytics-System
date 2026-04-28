import { Router, type IRouter } from "express";
import { ListTargetRolesResponse } from "@workspace/api-zod";
import { TARGET_ROLES } from "../lib/roles";

const router: IRouter = Router();

router.get("/skills/roles", (_req, res) => {
  res.json(ListTargetRolesResponse.parse(TARGET_ROLES));
});

export default router;
