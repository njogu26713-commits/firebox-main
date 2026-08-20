import { Router, type IRouter } from "express";
import healthRouter from "./health";
import servicesRouter from "./services";
import adminRouter from "./admin";
import aiRouter from "./ai";
import tutorialsRouter from "./tutorials";
import socialSettingsRouter from "./social-settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(servicesRouter);
router.use(adminRouter);
router.use(aiRouter);
router.use(tutorialsRouter);
router.use(socialSettingsRouter);

export default router;
