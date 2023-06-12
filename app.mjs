import express from "express";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";

import "./database/connection.mjs";
import config from "./config/config.mjs";
import AppErrorHandler from "./config/error.mjs";
import { morganErrorHandler, morganSuccessHandler } from "./config/morgan.mjs";
import usersRoutes from "./routes/users.routes.mjs";
import checksRoutes from "./routes/checks.routes.mjs";
import reportsRoutes from "./routes/reports.routes.mjs";
import "./utils/cronJobs.mjs";

const app = express();

app.use(morganSuccessHandler);
app.use(morganErrorHandler);
app.use(cors());

app.use(helmet());

app.use(express.json({ limit: config.router.limit.request }));
app.use(
  express.urlencoded({
    extended: true,
    limit: config.router.limit.request,
    parameterLimit: config.router.limit.parameter,
  })
);

app.use(compression());

app.use("/api/users", usersRoutes);
app.use("/api/checks", checksRoutes);
app.use("/api/reports", reportsRoutes);

app.use(AppErrorHandler.handler);
app.use(AppErrorHandler.notFound);

export default app;
