import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve the built frontend in production.
// Use import.meta.url (ESM-native) so the path is always relative to this
// bundle file (artifacts/api-server/dist/index.mjs), regardless of CWD.
try {
  const bundleDir = path.dirname(fileURLToPath(import.meta.url));
  const frontendDist =
    process.env.FRONTEND_DIST_PATH ??
    path.join(bundleDir, "../../firebox/dist/public");

  if (existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    // SPA fallback — let the frontend router handle all non-API paths
    app.get("*", (_req, res) => {
      res.sendFile(path.join(frontendDist, "index.html"));
    });
    logger.info({ frontendDist }, "Serving frontend static files");
  } else {
    logger.warn({ frontendDist }, "Frontend dist not found, skipping static serving");
  }
} catch (err) {
  logger.error({ err }, "Failed to set up frontend static serving");
}

export default app;
