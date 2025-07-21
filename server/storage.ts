import { 
  users, 
  cargo,
  cargoFlightSegments,
  cargoStatusHistory,
  contactSubmissions,
  testimonials,
  branches,
  blogPosts,
  seoSettings,
  faqs,
  type User, 
  type InsertUser,
  type Cargo,
  type InsertCargo,
  type CargoFlightSegment,
  type InsertCargoFlightSegment,
  type CargoStatusHistory,
  type InsertCargoStatusHistory,
  type ContactSubmission,
  type InsertContactSubmission,
  type Testimonial,
  type InsertTestimonial,
  type Branch,
  type InsertBranch,
  type BlogPost,
  type InsertBlogPost,
  type SeoSettings,
  type InsertSeoSettings,
  type Faq,
  type InsertFaq,
  insertFaqSchema,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, count } from "drizzle-orm";
import session from "express-session";

// Remove: const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Cargo methods
  getCargo(id: number): Promise<Cargo | undefined>;
  getCargoByTrackingNumber(trackingNumber: string): Promise<Cargo | undefined>;
  createCargo(cargo: InsertCargo): Promise<Cargo>;
  updateCargoStatus(id: number, status: string): Promise<Cargo | undefined>;
  updateCargoDetails(id: number, data: Partial<InsertCargo>): Promise<Cargo | undefined>;
  getAllCargo(page?: number, limit?: number): Promise<{ cargo: Cargo[], total: number }>;

  // New: Flight segments and status history
  getCargoFlightSegments(cargoId: number): Promise<CargoFlightSegment[]>;
  getCargoStatusHistory(cargoId: number): Promise<CargoStatusHistory[]>;
  addCargoFlightSegment(segment: InsertCargoFlightSegment): Promise<CargoFlightSegment>;
  addCargoStatusHistory(entry: InsertCargoStatusHistory): Promise<CargoStatusHistory>;
  updateCargoFlightSegment(id: number, segment: Partial<InsertCargoFlightSegment>): Promise<CargoFlightSegment | undefined>;
  
  // Contact submission methods
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getAllContactSubmissions(page?: number, limit?: number): Promise<{ submissions: ContactSubmission[], total: number }>;
  markContactSubmissionAsRead(id: number): Promise<ContactSubmission | undefined>;
  
  // Testimonial methods
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  getAllTestimonials(approved?: boolean): Promise<Testimonial[]>;
  approveTestimonial(id: number): Promise<Testimonial | undefined>;
  rejectTestimonial(id: number): Promise<void>;
  
  // Branch methods
  createBranch(branch: InsertBranch): Promise<Branch>;
  getAllBranches(activeOnly?: boolean, page?: number, limit?: number): Promise<{ branches: Branch[], total: number }>;
  updateBranch(id: number, branch: Partial<InsertBranch>): Promise<Branch | undefined>;
  deleteBranch(id: number): Promise<void>;
  getBranchesCount(activeOnly?: boolean): Promise<number>;
  
  // Blog post methods
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getAllBlogPosts(published?: boolean, page?: number, limit?: number): Promise<{ posts: BlogPost[], total: number }>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<void>;
  
  // SEO settings methods
  getSeoSettings(page: string): Promise<SeoSettings | undefined>;
    upsertSeoSettings(settings: InsertSeoSettings): Promise<SeoSettings>;

  // FAQ methods
  getAllFaqs(isActive?: boolean): Promise<Faq[]>;
  createFaq(faq: InsertFaq): Promise<Faq>;
  updateFaq(id: number, faq: InsertFaq): Promise<Faq | undefined>;
  deleteFaq(id: number): Promise<void>;
  }
  

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  // Accept sessionStore as a parameter
  constructor(sessionStore: session.Store) {
    this.sessionStore = sessionStore;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (user && "password" in user) delete (user as any).password;
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Defensive: always select password field for login
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Set default role if not provided
    const role = (insertUser as any).role ?? "admin";
    // Defensive: never log password
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, role })
      .returning();
    // Never return password field
    if (user && "password" in user) delete (user as any).password;
    return user;
  }

  // Cargo methods
  async getCargo(id: number): Promise<Cargo | undefined> {
    const [cargoItem] = await db.select().from(cargo).where(eq(cargo.id, id));
    return cargoItem || undefined;
  }

  async getCargoByTrackingNumber(trackingNumber: string): Promise<Cargo | undefined> {
    const [cargoItem] = await db
      .select()
      .from(cargo)
      .where(eq(cargo.trackingNumber, trackingNumber));
    return cargoItem || undefined;
  }

  async createCargo(insertCargo: InsertCargo): Promise<Cargo> {
    const now = new Date();
    const trackingNumber = this.generateTrackingNumber();
    
    const [cargoItem] = await db
      .insert(cargo)
      .values({
        ...insertCargo,
        trackingNumber,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return cargoItem;
  }

  async updateCargoStatus(id: number, status: string): Promise<Cargo | undefined> {
    const [cargoItem] = await db
      .update(cargo)
      .set({ status, updatedAt: new Date() })
      .where(eq(cargo.id, id))
      .returning();
    return cargoItem || undefined;
  }

  async updateCargoDetails(id: number, data: Partial<InsertCargo>): Promise<Cargo | undefined> {
    // Defensive: never allow updating id, trackingNumber, createdAt, updatedAt, status here
    const allowed: Partial<InsertCargo> = {};
    for (const key of [
      "customerName", "customerPhone", "salesRepName", "cargoDescription",
      "origin", "destination", "weight", "dimensions"
    ] as (keyof InsertCargo)[]) {
      if (data[key] !== undefined && data[key] !== null) allowed[key] = data[key];
    }
    const [cargoItem] = await db
      .update(cargo)
      .set({ ...allowed, updatedAt: new Date() })
      .where(eq(cargo.id, id))
      .returning();
    return cargoItem || undefined;
  }

  async getAllCargo(page = 1, limit = 50): Promise<{ cargo: Cargo[], total: number }> {
    const offset = (page - 1) * limit;
    
    const [cargoList, totalResult] = await Promise.all([
      db.select().from(cargo).orderBy(desc(cargo.createdAt)).limit(limit).offset(offset),
      db.select({ count: count() }).from(cargo)
    ]);
    
    return { cargo: cargoList, total: totalResult[0].count };
  }

  // New: Flight segments and status history
  async getCargoFlightSegments(cargoId: number) {
    return db.select().from(cargoFlightSegments).where(eq(cargoFlightSegments.cargoId, cargoId));
  }
  async getCargoStatusHistory(cargoId: number) {
    return db.select().from(cargoStatusHistory).where(eq(cargoStatusHistory.cargoId, cargoId)).orderBy(desc(cargoStatusHistory.timestamp));
  }
  async addCargoFlightSegment(segment: InsertCargoFlightSegment) {
    // Convert string to Date if needed
    const toDate = (val: any) => {
      if (!val) return undefined;
      if (val instanceof Date) return val;
      // Accept "YYYY-MM-DDTHH:mm" or "YYYY-MM-DDTHH:mm:ss"
      // If missing seconds, add ":00"
      let str = String(val);
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(str)) str += ":00";
      const d = new Date(str);
      return isNaN(d.getTime()) ? undefined : d;
    };
    const departureTime = toDate(segment.departureTime);
    const arrivalTime = toDate(segment.arrivalTime);
    if (!departureTime || !arrivalTime) {
      throw new Error("Invalid departure/arrival time format");
    }
    const values: InsertCargoFlightSegment = {
      ...segment,
      departureTime,
      arrivalTime,
    };
    const [row] = await db.insert(cargoFlightSegments).values(values).returning();
    return row;
  }
  async addCargoStatusHistory(entry: InsertCargoStatusHistory) {
    // Ensure required fields are present and set timestamp if missing
    if (!entry.status || !entry.cargoId) {
      throw new Error("Missing required fields: status and cargoId");
    }
    const values: InsertCargoStatusHistory = {
      status: entry.status,
      cargoId: entry.cargoId,
      details: entry.details,
      location: entry.location,
      timestamp: entry.timestamp ?? new Date()
    };
    const [row] = await db.insert(cargoStatusHistory).values(values).returning();
    return row;
  }
  async updateCargoFlightSegment(id: number, segment: Partial<InsertCargoFlightSegment>) {
    // Convert string to Date if needed
    const toDate = (val: any) => {
      if (!val) return undefined;
      if (val instanceof Date) return val;
      let str = String(val);
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(str)) str += ":00";
      const d = new Date(str);
      return isNaN(d.getTime()) ? undefined : d;
    };
    const values: Partial<InsertCargoFlightSegment> = { ...segment };
    if (segment.departureTime) values.departureTime = toDate(segment.departureTime);
    if (segment.arrivalTime) values.arrivalTime = toDate(segment.arrivalTime);
    const [row] = await db
      .update(cargoFlightSegments)
      .set(values)
      .where(eq(cargoFlightSegments.id, id))
      .returning();
    return row || undefined;
  }

  // Contact submission methods
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [result] = await db
      .insert(contactSubmissions)
      .values(submission)
      .returning();
    return result;
  }

  async getAllContactSubmissions(page = 1, limit = 50): Promise<{ submissions: ContactSubmission[], total: number }> {
    const offset = (page - 1) * limit;
    
    const [submissions, totalResult] = await Promise.all([
      db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt)).limit(limit).offset(offset),
      db.select({ count: count() }).from(contactSubmissions)
    ]);
    
    return { submissions, total: totalResult[0].count };
  }

  async markContactSubmissionAsRead(id: number): Promise<ContactSubmission | undefined> {
    const [submission] = await db
      .update(contactSubmissions)
      .set({ isRead: true })
      .where(eq(contactSubmissions.id, id))
      .returning();
    return submission || undefined;
  }

  // Testimonial methods
  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const [result] = await db
      .insert(testimonials)
      .values(testimonial)
      .returning();
    return result;
  }

  async getAllTestimonials(approved?: boolean): Promise<Testimonial[]> {
    let results;
    if (approved !== undefined) {
      results = await db
        .select()
        .from(testimonials)
        .where(eq(testimonials.isApproved, approved))
        .orderBy(desc(testimonials.createdAt));
    } else {
      results = await db
        .select()
        .from(testimonials)
        .orderBy(desc(testimonials.createdAt));
    }
    // Ensure isApproved is always boolean
    return results.map(t => ({
      ...t,
      isApproved: !!t.isApproved && String(t.isApproved) !== "false" && Number(t.isApproved) !== 0,
    }));
  }

  async approveTestimonial(id: number): Promise<Testimonial | undefined> {
    const [testimonial] = await db
      .update(testimonials)
      .set({ isApproved: true })
      .where(eq(testimonials.id, id))
      .returning();
    return testimonial || undefined;
  }

  async rejectTestimonial(id: number): Promise<void> {
    await db.delete(testimonials).where(eq(testimonials.id, id));
  }

  // Branch methods
  async createBranch(branch: InsertBranch): Promise<Branch> {
    const [result] = await db
      .insert(branches)
      .values(branch)
      .returning();
    return result;
  }

  async getAllBranches(activeOnly = false, page = 1, limit = 50): Promise<{ branches: Branch[], total: number }> {
    const offset = (page - 1) * limit;
    const query = db.select().from(branches);
    if (activeOnly) {
        query.where(eq(branches.isActive, true));
    }
    const [branchList, totalResult] = await Promise.all([
        query.orderBy(branches.name).limit(limit).offset(offset),
        db.select({ count: count() }).from(branches).where(activeOnly ? eq(branches.isActive, true) : undefined),
    ]);
    return { branches: branchList, total: totalResult[0].count };
  }

  async updateBranch(id: number, branch: Partial<InsertBranch>): Promise<Branch | undefined> {
    const [result] = await db
      .update(branches)
      .set(branch)
      .where(eq(branches.id, id))
      .returning();
    return result || undefined;
  }

  async deleteBranch(id: number): Promise<void> {
    await db.delete(branches).where(eq(branches.id, id));
  }

  async getBranchesCount(activeOnly = false): Promise<number> {
    if (activeOnly) {
      const [result] = await db.select({ count: count() }).from(branches).where(eq(branches.isActive, true));
      return result.count;
    } else {
      const [result] = await db.select({ count: count() }).from(branches);
      return result.count;
    }
  }

  // Blog post methods
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const now = new Date();
    const [result] = await db
      .insert(blogPosts)
      .values({
        ...post,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return result;
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post || undefined;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post || undefined;
  }

  async getAllBlogPosts(published?: boolean, page = 1, limit = 10): Promise<{ posts: BlogPost[], total: number }> {
    const offset = (page - 1) * limit;
    const query = db.select().from(blogPosts);
    if (published !== undefined) {
        query.where(eq(blogPosts.isPublished, published));
    }
    const [postList, totalResult] = await Promise.all([
        query.orderBy(desc(blogPosts.createdAt)).limit(limit).offset(offset),
        db.select({ count: count() }).from(blogPosts).where(published !== undefined ? eq(blogPosts.isPublished, published) : undefined),
    ]);
    return { posts: postList, total: totalResult[0].count };
  }

  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [result] = await db
      .update(blogPosts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return result || undefined;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  // SEO settings methods
  async getSeoSettings(page: string): Promise<SeoSettings | undefined> {
    const [settings] = await db.select().from(seoSettings).where(eq(seoSettings.page, page));
    return settings || undefined;
  }

  async upsertSeoSettings(settings: InsertSeoSettings): Promise<SeoSettings> {
    const existing = await this.getSeoSettings(settings.page);
    
    if (existing) {
      const [result] = await db
        .update(seoSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(seoSettings.page, settings.page))
        .returning();
      return result;
    } else {
      const [result] = await db
        .insert(seoSettings)
        .values({ ...settings, updatedAt: new Date() })
        .returning();
      return result;
    }
  }

  // FAQ methods
  async getAllFaqs(isActive?: boolean): Promise<Faq[]> {
    if (isActive === undefined) {
      return await db.select().from(faqs);
    } else {
      return await db.select().from(faqs).where(eq(faqs.isActive, isActive));
    }
  }
  async createFaq(faq: InsertFaq): Promise<Faq> {
    // Defensive: ensure required fields
    // Remove logging for debugging (do not log user input)
    const [created] = await db.insert(faqs).values(faq).returning();
    if (!created) {
      throw new Error("FAQ creation failed");
    }
    return created;
  }
  async updateFaq(id: number, faq: InsertFaq): Promise<Faq | undefined> {
    const [updated] = await db.update(faqs).set(faq).where(eq(faqs.id, id)).returning();
    return updated;
  }
  async deleteFaq(id: number): Promise<void> {
    await db.delete(faqs).where(eq(faqs.id, id));
  }

  async deleteCargo(id: number): Promise<void> {
    // Delete related records first to avoid FK violation
    await db.delete(cargoFlightSegments).where(eq(cargoFlightSegments.cargoId, id));
    await db.delete(cargoStatusHistory).where(eq(cargoStatusHistory.cargoId, id));
    await db.delete(cargo).where(eq(cargo.id, id));
  }

  // Helper method to generate tracking numbers
  private generateTrackingNumber(): string {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const rn = String(Math.floor(Math.random() * 100)).padStart(2, '0');

    return `${dd}${mm}${yy}${hh}${min}${ss}${rn}`;
  }
}

// Export a function to create storage with a given session store
export function createStorage(sessionStore: session.Store) {
  return new DatabaseStorage(sessionStore);
}

