import express from "express";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";

import config from "./config/config.mjs";
import AppErrorHandler from "./config/error.mjs";
import { morganErrorHandler, morganSuccessHandler } from "./config/morgan.mjs";
import response from "./config/response.mjs";

dotenv.config()

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

app.use(response);

app.use(AppErrorHandler.handler);
app.use(AppErrorHandler.notFound);

export default app;
