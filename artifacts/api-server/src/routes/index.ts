import { Router, type IRouter } from "express";
import healthRouter from "./health";
import studentsRouter from "./students";
import adminRouter from "./admin";
import skillsRouter from "./skills";

const router: IRouter = Router();

router.use(healthRouter);
router.use(studentsRouter);
router.use(adminRouter);
router.use(skillsRouter);

export default router;
