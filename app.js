import cors from "cors";
import cookieParser from "cookie-parsesr";
import express from "express";
import logger from "morgan";
import path from "path";
import {logger as winstonLogger} from "./utils/logger.js";
import {
    notFoundHandler,
    errorHandler,
    apiErrorHandler,
} from "./middlewares/error.js";
import indexRouter from "./routes/index.js";


const app = express();

app.use(
    logger("dev", {
        skip: (req, res) => req.method === "OPTIONS",
    })
);

app.use(express.json({ limit: "1gb"}));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.resolve("public")));

app.use((req, res, next) => {
    const { method, url } = req;
    winstonLogger.info(`${method} ${url}`);
    next();
});

app.use("/api", indexRouter);

app.use(notFoundHandler);
app.use(apiErrorHandler);
app.use(errorHandler);

export default app;