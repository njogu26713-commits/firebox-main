import { Router, type IRouter } from "express";
import healthRouter from "./health";
import servicesRouter from "./services";
import adminRouter from "./admin";
import aiRouter from "./ai";
import tutorialsRouter from "./tutorials";

const router: IRouter = Router();

router.use(healthRouter);
router.use(servicesRouter);
router.use(adminRouter);
router.use(aiRouter);
router.use(tutorialsRouter);

export default router;
