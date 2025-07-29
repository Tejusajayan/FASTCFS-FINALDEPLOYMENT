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
    origin: 'https://www.fastcfs.com', // change to your domain in production for security
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

(async () => {
  // Pass storage to registerRoutes
  const server = await registerRoutes(app, storage);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  
  if (app.get("env") === "development") {
    await setupVite(app, server); // Pass app and server
  } else {
    serveStatic(app); // Pass app
  }


  const port = 5000;
  server.listen(
    port,
    "0.0.0.0",
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
