import express, { type Express, type Request } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
// Remove: import { storage } from "./storage";
import { Session, SessionData } from "express-session";
import {
  insertContactSubmissionSchema,
  insertCargoSchema,
  insertBranchSchema,
  insertTestimonialSchema,
  insertBlogPostSchema,
  insertSeoSettingsSchema,
  insertFaqSchema,
  insertUserSchema,
} from "@shared/schema";
import bcrypt from "bcrypt";


// Extend Express Request interface to include 'user' and 'session'
declare global {
  namespace Express {
    interface User {
      id: number | string;
      [key: string]: any;
    }
    interface Request {
      user?: User;
      session: Session & Partial<SessionData>;
    }
  }
  // Extend express-session SessionData to include 'user'
  namespace ExpressSession {
    interface SessionData {
      user?: {
        id: number | string;
        username: string;
        role: string;
        [key: string]: any;
      };
    }
  }
}


function requireAuth(req: any, res: any, next: any) {
  // Accept either Passport.js or a simple user check for mock/dev
  if (!req.session?.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Accept storage as a parameter
export function registerRoutes(app: Express, storage: any): Server {
  console.log("[routes] Registering API routes"); // Add log for route registration
  // Setup authentication routes
  setupAuth(app);

  app.get("/api/cargo/track/:trackingNumber", async (req, res) => {
    try {
      const trackingNumber = req.params.trackingNumber;
      const cargo = await storage.getCargoByTrackingNumber(trackingNumber);
      if (!cargo) {
        return res.status(404).json({ message: "Cargo not found. Please check your tracking number and try again." });
      }
      // Fetch flight segments and status history
      const [flightSegments, statusHistory] = await Promise.all([
        storage.getCargoFlightSegments(cargo.id),
        storage.getCargoStatusHistory(cargo.id)
      ]);
      res.json({ cargo, flightSegments, statusHistory });
    } catch (error) {
      console.error("Error fetching cargo:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // --- ADD: endpoints for admin to fetch status history and flight segments by cargoId ---
  app.get("/api/admin/cargo/:id/status-history", requireAuth, async (req, res) => {
    try {
      const cargoId = parseInt(req.params.id);
      const history = await storage.getCargoStatusHistory(cargoId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/cargo/:id/status-history", requireAuth, async (req, res) => {
    try {
      const cargoId = parseInt(req.params.id);
      const { status, details, location } = req.body;
      if (!status) return res.status(400).json({ message: "Status is required" });
      const entry = await storage.addCargoStatusHistory({ cargoId, status, details, location });
      res.status(201).json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.get("/api/admin/cargo/:id/flight-segments", requireAuth, async (req, res) => {
    try {
      const cargoId = parseInt(req.params.id);
      const segments = await storage.getCargoFlightSegments(cargoId);
      res.json(segments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/cargo/:id/flight-segments", requireAuth, async (req, res) => {
    try {
      const cargoId = parseInt(req.params.id);
      const segment = await storage.addCargoFlightSegment({ ...req.body, cargoId });
      res.status(201).json(segment);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  // Update flight segment
  app.put("/api/admin/cargo/:cargoId/flight-segments/:segmentId", requireAuth, async (req, res) => {
    try {
      const cargoId = parseInt(req.params.cargoId);
      const segmentId = parseInt(req.params.segmentId);
      const segment = await storage.updateCargoFlightSegment(segmentId, { ...req.body, cargoId });
      if (!segment) {
        return res.status(404).json({ message: "Flight segment not found" });
      }
      res.json(segment);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      res.status(201).json(submission);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  // Testimonial submission
  app.post("/api/testimonials", async (req, res) => {
    try {
      const validatedData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(validatedData);
      res.status(201).json(testimonial);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  // Get approved testimonials
  app.get("/api/testimonials", async (req, res) => {
    try {
      // Only return approved testimonials for public API
      const testimonials = await storage.getAllTestimonials(true);
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get branches
  app.get("/api/branches", async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const { branches, total } = await storage.getAllBranches(true, page, limit);
        res.json({ branches, total });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin branches management
  app.get("/api/admin/branches", requireAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const { branches, total } = await storage.getAllBranches(false, page, limit); // Fetch all branches
        res.json({ branches, total });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get published blog posts
  app.get("/api/blog", async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const { posts, total } = await storage.getAllBlogPosts(true, page, limit);
        res.json({ posts, total });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get blog post by slug
  app.get("/api/blog/:slug", async (req, res) => {
    try {
      type BlogPost = { isPublished: boolean; [key: string]: any };
      const post = await storage.getBlogPostBySlug(req.params.slug) as BlogPost | null;
      if (!post || !post.isPublished) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get SEO settings
  app.get("/api/seo/:page", async (req, res) => {
    try {
      const settings = await storage.getSeoSettings(req.params.page);
      if (!settings) {
        return res.status(404).json({ message: "SEO settings not found" });
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin-only routes (protected)

  // Cargo management
  app.post("/api/admin/cargo", requireAuth, async (req, res) => {
    try {
      const validatedData = insertCargoSchema.parse(req.body);
      const cargo = await storage.createCargo(validatedData);
      res.status(201).json(cargo);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.get("/api/admin/cargo", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await storage.getAllCargo(page, limit);
      res.json({ cargo: result.cargo, total: result.total });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/cargo/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      const cargo = await storage.updateCargoStatus(parseInt(req.params.id), status);
      if (!cargo) {
        return res.status(404).json({ message: "Cargo not found" });
      }
      res.json(cargo);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ADD: Update cargo/customer details endpoint
  app.put("/api/admin/cargo/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Defensive: validate input using Zod
      const validatedData = insertCargoSchema.partial().parse(req.body);
      // Only allow updating allowed fields
      const allowedFields = [
        "customerName", "customerPhone", "salesRepName", "cargoDescription",
        "origin", "destination", "weight", "dimensions"
      ];
      const updateData: Record<string, any> = {};
      for (const key of allowedFields) {
        if (validatedData[key as keyof typeof validatedData] !== undefined) {
          updateData[key] = validatedData[key as keyof typeof validatedData];
        }
      }
      const updated = await storage.updateCargoDetails(id, updateData);
      if (!updated) {
        return res.status(404).json({ message: "Cargo not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  // ADD: Delete cargo endpoint (including dependent records)
  app.delete("/api/admin/cargo/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Defensive: check if cargo exists
      const cargoItem = await storage.getCargo(id);
      if (!cargoItem) {
        return res.status(404).json({ message: "Cargo not found" });
      }
      await storage.deleteCargo(id); // This should delete dependent records too
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete cargo" });
    }
  });

  // Export cargo data as CSV
  app.get("/api/admin/cargo/export", requireAuth, async (req, res) => {
    try {
      const { cargo: cargoList } = await storage.getAllCargo(); // Get all cargo

      type CargoExport = {
        trackingNumber: string;
        customerName: string;
        customerPhone: string;
        salesRepName: string;
        cargoDescription: string;
        status: string;
        createdAt: string;
      };

      const csvHeader = "Tracking Number,Customer Name,Phone,Sales Rep,Description,Status,Created Date\n";
      const csvData = cargoList.map((item: any) => 
        `"${item.trackingNumber}","${item.customerName}","${item.customerPhone}","${item.salesRepName}","${item.cargoDescription}","${item.status}","${item.createdAt ? (item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt) : ""}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="cargo-export.csv"');
      res.send(csvHeader + csvData);
    } catch (error) {
      res.status(500).json({ message: "Export failed" });
    }
  });

  // Contact submissions management
  app.get("/api/admin/contact-submissions", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await storage.getAllContactSubmissions(page, limit);
      // Defensive: always return { submissions, total }
      res.json({ submissions: result.submissions, total: result.total });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/contact-submissions/:id/read", requireAuth, async (req, res) => {
    try {
      const submission = await storage.markContactSubmissionAsRead(parseInt(req.params.id));
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      res.json(submission);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Testimonials management
  app.get("/api/admin/testimonials", requireAuth, async (req, res) => {
    try {
      // Fetch all testimonials for admin (no approval filter)
      const testimonials = await storage.getAllTestimonials(undefined);
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/testimonials/:id/approve", requireAuth, async (req, res) => {
    try {
      const testimonial = await storage.approveTestimonial(parseInt(req.params.id));
      if (!testimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      res.json(testimonial);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/testimonials/:id", requireAuth, async (req, res) => {
    try {
      await storage.rejectTestimonial(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Branches management
  app.post("/api/admin/branches", requireAuth, async (req, res) => {
    try {
      const validatedData = insertBranchSchema.parse(req.body); // location included
      const branch = await storage.createBranch(validatedData);
      res.status(201).json(branch);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.get("/api/admin/branches", requireAuth, async (req, res) => {
    try {
      // Return all branches (active and inactive) for admin
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const branches = await storage.getAllBranches(undefined, page, limit);
      const total = branches.length;
      res.json({ branches, total });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/branches/:id", requireAuth, async (req, res) => {
    try {
      // Defensive: validate input using Zod
      const validatedData = insertBranchSchema.parse(req.body); // location included
      const branch = await storage.updateBranch(parseInt(req.params.id), validatedData);
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }
      res.json(branch);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.delete("/api/admin/branches/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteBranch(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Blog management
  app.post("/api/admin/blog", requireAuth, async (req, res) => {
    try {
      const validatedData = insertBlogPostSchema.parse({
        ...req.body,
        authorId: (req.session as Session & { user?: { id: number | string } }).user?.id
      });
      const post = await storage.createBlogPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.get("/api/admin/blog", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await storage.getAllBlogPosts(undefined, page, limit);
      // Defensive: always return { posts, total }
      res.json({ posts: result.posts, total: result.total });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/blog/:id", requireAuth, async (req, res) => {
    try {
      // Defensive: validate input using Zod
      const validatedData = insertBlogPostSchema.parse(req.body);
      const post = await storage.updateBlogPost(parseInt(req.params.id), validatedData);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.delete("/api/admin/blog/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteBlogPost(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // SEO settings management
  app.put("/api/admin/seo", requireAuth, async (req, res) => {
    try {
      const validatedData = insertSeoSettingsSchema.parse(req.body);
      const settings = await storage.upsertSeoSettings(validatedData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  // --- FAQ ADMIN ENDPOINTS ---
  // FAQ admin endpoints
  app.get("/api/admin/faqs", requireAuth, async (req, res) => {
    try {
      // Optionally filter by isActive via query param
      const isActive = req.query.isActive !== undefined ? req.query.isActive === "true" : undefined;
      const faqs = await storage.getAllFaqs(isActive);
      res.json(faqs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/faqs", requireAuth, async (req, res) => {
    try {
      const validatedData = insertFaqSchema.parse(req.body);
      const faq = await storage.createFaq(validatedData);
      res.status(201).json(faq);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.put("/api/admin/faqs/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Defensive: validate input using Zod
      const validatedData = insertFaqSchema.parse(req.body);
      const faq = await storage.updateFaq(id, validatedData);
      if (!faq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      res.json(faq);
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.delete("/api/admin/faqs/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFaq(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ADD: Public FAQ endpoint for frontend
  app.get("/api/faqs", async (req, res) => {
    try {
      const faqs = await storage.getAllFaqs(true); // Only active FAQs
      res.json(faqs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // --- Registration endpoint for development/demo ---
  app.post("/api/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      // Check if user exists
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(409).json({ message: "Username already exists" });
      }
      // Hash password with bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);
      // Defensive: validate input using Zod
      const validatedUser = insertUserSchema.parse({
        username,
        password: hashedPassword,
      });
      const user = await storage.createUser(validatedUser);
      // Never return password field
      if (user && "password" in user) delete (user as any).password;
      // Set session user
      req.session = req.session || {};
      (req.session as Session & { user?: { id: number | string; username: string; role: string } }).user = { id: user.id, username: user.username, role: user.role };
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // --- Login endpoint ---
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      // Compare password using bcrypt
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      // Never return password field
      if (user && "password" in user) delete (user as any).password;
      // Set session user
      req.session = req.session || {};
      (req.session as Session & { user?: { id: number | string; username: string; role: string } }).user = { id: user.id, username: user.username, role: user.role };
      // Save session before sending response
      req.session.save((err: any) => {
        if (err) {
          return res.status(500).json({ message: "Session save failed" });
        }
        res.status(200).json(user);
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // --- Logout endpoint ---
  app.post("/api/logout", (req, res) => {
    if (req.session && typeof req.session.destroy === "function") {
      req.session.destroy(() => {
        res.status(204).end();
      });
    } else {
      // If session is missing, just return 204 (already logged out)
      res.status(204).end();
    }
  });

  // --- Authenticated user endpoint ---
  app.get("/api/user", (req, res) => {
    // Defensive: check req.session and req.session.user
    const sessionUser = req.session && (req.session as Session & { user?: { id: number | string; username: string; role: string } }).user;
    if (sessionUser) {
      res.json(sessionUser);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Development seeding endpoint (remove in production)
  if (process.env.NODE_ENV === "development") {
    app.post("/api/dev/seed", async (req, res) => {
      try {
        // Mock hashPassword for development seeding
        const hashPassword = async (password: string) => `hashed_${password}`;
        const existingAdmin = await storage.getUserByUsername("admin");
        if (!existingAdmin) {
          await storage.createUser({
            username: "admin",
            password: await hashPassword("admin123")
          });
        }

        // Create sample cargo
        // (Development seeding logic continues here...)
        res.status(201).json({ message: "Development seed completed" });
      } catch (error) {
        res.status(500).json({ message: "Development seed failed" });
      }
    });
  }

  // Return the HTTP server instance as required by the function signature
  return createServer(app);
}