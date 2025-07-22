import dotenv from "dotenv";
dotenv.config();
import express, { type Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import { registerRoutes } from "./routes.ts";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { createStorage } from "./storage";
import cors from "cors";

// --- Add session middleware before routes ---
const PgSession = connectPg(session);

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Create a single session store instance
const sessionStore = new PgSession({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: true,
  // ...other options...
});

const app = express();

app.use(cors({
    origin: 'https://www.fastcfscn.com', // change to your domain in production for security
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }));
  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);

// Create storage with the same session store
const storage = createStorage(sessionStore);

// Remove this verbose logging middleware:
// app.use((req, res, next) => {
//   const start = Date.now();
//   const path = req.path;

//   res.on("finish", () => {
//     const duration = Date.now() - start;
//     // Only log API requests, ignore static/frontend requests
//     if (path.startsWith("/api")) {
//       log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
//     }
//   });

//   next();
// });

(async () => {
  // Pass storage to registerRoutes
  const server = await registerRoutes(app, storage);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server); // Pass app and server
  } else {
    serveStatic(app); // Pass app
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen(
    port,
    "0.0.0.0",
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
