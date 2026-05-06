import path from "node:path";
import fs from "node:fs";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
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

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

const allowedOrigins = new Set<string>(
  (process.env["REPLIT_DOMAINS"] ?? "")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => `https://${d}`),
);
const isDev = process.env["NODE_ENV"] !== "production";

app.use(
  cors({
    credentials: true,
    origin(origin, cb) {
      // Same-origin requests (no Origin header) and our proxied frontends are always allowed.
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      if (isDev) return cb(null, true);
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env["CLERK_PUBLISHABLE_KEY"],
    ),
  })),
);

app.use("/api", router);

// In production deployments (e.g. fly.io), the API server also serves the
// built frontend so that everything lives on a single origin (no CORS, and
// Clerk Frontend API proxying via /api/__clerk works against same-origin).
const staticDir = process.env["STATIC_DIR"];
if (staticDir) {
  const resolved = path.resolve(staticDir);
  if (fs.existsSync(resolved)) {
    const indexHtml = path.join(resolved, "index.html");
    app.use(express.static(resolved, { index: false, maxAge: "1h" }));
    // SPA fallback: anything that isn't /api/* falls through to index.html
    app.get(/^\/(?!api(?:\/|$)).*/, (_req, res, next) => {
      if (!fs.existsSync(indexHtml)) return next();
      res.sendFile(indexHtml);
    });
    logger.info({ staticDir: resolved }, "Serving static frontend");
  } else {
    logger.warn({ staticDir: resolved }, "STATIC_DIR does not exist");
  }
}

export default app;
