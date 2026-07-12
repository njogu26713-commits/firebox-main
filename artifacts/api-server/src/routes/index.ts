import { Router, type IRouter } from "express";
import healthRouter from "./health";
import servicesRouter from "./services";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(servicesRouter);
router.use(adminRouter);

export default router;
