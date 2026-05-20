import { Router } from "express";
import authRouter from "./auth";
import publicRouter from "./public";
import dashboardRouter from "./dashboard";
import superRouter from "./super";
import healthRouter from "./health";

const router = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/u", publicRouter);
router.use("/dashboard", dashboardRouter);
router.use("/super", superRouter);

export default router;
