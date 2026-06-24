import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import adminsRouter from "./admins";
import coursesRouter from "./courses";
import batchesRouter from "./batches";
import lecturesRouter from "./lectures";
import liveClassesRouter from "./liveClasses";
import notesRouter from "./notes";
import certificatesRouter from "./certificates";
import notificationsRouter from "./notifications";
import activityLogsRouter from "./activityLogs";
import deviceSessionsRouter from "./deviceSessions";
import settingsRouter from "./settings";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/admins", adminsRouter);
router.use("/courses", coursesRouter);
router.use("/batches", batchesRouter);
router.use("/lectures", lecturesRouter);
router.use("/live-classes", liveClassesRouter);
router.use("/notes", notesRouter);
router.use("/certificates", certificatesRouter);
router.use("/notifications", notificationsRouter);
router.use("/activity-logs", activityLogsRouter);
router.use("/device-sessions", deviceSessionsRouter);
router.use("/settings", settingsRouter);
router.use("/dashboard", dashboardRouter);

export default router;
