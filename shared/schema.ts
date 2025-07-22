import { pgTable, text, serial, integer, boolean, timestamp, varchar} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for admin authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cargo tracking table
export const cargo = pgTable("cargo", {
  id: serial("id").primaryKey(),
  trackingNumber: varchar("tracking_number", { length: 50 }).notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  salesRepName: text("sales_rep_name").notNull(),
  cargoDescription: text("cargo_description").notNull(),
  status: text("status").notNull().default("received"),
  origin: text("origin"),
  destination: text("destination"),
  weight: text("weight"),
  dimensions: text("dimensions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// New: Cargo flight segments (for multi-leg/connecting flights)
export const cargoFlightSegments = pgTable("cargo_flight_segments", {
  id: serial("id").primaryKey(),
  cargoId: integer("cargo_id").references(() => cargo.id).notNull(),
  flightNumber: text("flight_number").notNull(),
  airline: text("airline"),
  departureAirport: text("departure_airport").notNull(),
  arrivalAirport: text("arrival_airport").notNull(),
  departureTime: timestamp("departure_time").notNull(),
  arrivalTime: timestamp("arrival_time").notNull(),
  pieces: text("pieces"), // e.g. 4/4
  weight: text("weight"),
  volume: text("volume"),
  status: text("status").notNull(), // e.g. Planned, Booked, In Transit, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// New: Cargo status history (for timeline/status updates)
export const cargoStatusHistory = pgTable("cargo_status_history", {
  id: serial("id").primaryKey(),
  cargoId: integer("cargo_id").references(() => cargo.id).notNull(),
  status: text("status").notNull(),
  details: text("details"), // e.g. remarks, location, etc.
  location: text("location"), // NEW: location for status update
  timestamp: timestamp("timestamp").defaultNow(),
});

// Contact form submissions
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customer testimonials
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerLocation: text("customer_location"),
  content: text("content").notNull(),
  rating: integer("rating").default(5),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Company branches
export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  incharge: text("incharge").notNull().default("Unknown"),
  location: text("location"), // <-- Google Map location link (nullable)
  isMainOffice: boolean("is_main_office").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blog posts
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  category: text("category").notNull().default("General"),
  isPublished: boolean("is_published").default(false),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SEO settings for pages
export const seoSettings = pgTable("seo_settings", {
  id: serial("id").primaryKey(),
  page: text("page").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  keywords: text("keywords"),
  ogImage: text("og_image"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// --- FAQ table ---
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
}));



// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCargoSchema = createInsertSchema(cargo).omit({
  id: true,
  trackingNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  isApproved: true,
  createdAt: true,
});

export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  createdAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSeoSettingsSchema = createInsertSchema(seoSettings).omit({
  id: true,
  updatedAt: true,
});



export const insertCargoFlightSegmentSchema = createInsertSchema(cargoFlightSegments).omit({
  id: true,
  createdAt: true,
});

export const insertCargoStatusHistorySchema = createInsertSchema(cargoStatusHistory).omit({
  id: true,
});

export const insertFaqSchema = createInsertSchema(faqs).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Cargo = typeof cargo.$inferSelect;
export type InsertCargo = z.infer<typeof insertCargoSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Branch = typeof branches.$inferSelect;
export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type SeoSettings = typeof seoSettings.$inferSelect;
export type InsertSeoSettings = z.infer<typeof insertSeoSettingsSchema>;
export type CargoFlightSegment = typeof cargoFlightSegments.$inferSelect;
export type InsertCargoFlightSegment = z.infer<typeof insertCargoFlightSegmentSchema>;
export type CargoStatusHistory = typeof cargoStatusHistory.$inferSelect;
export type InsertCargoStatusHistory = z.infer<typeof insertCargoStatusHistorySchema>;
export type Faq = typeof faqs.$inferSelect;
export type InsertFaq = z.infer<typeof insertFaqSchema>;
