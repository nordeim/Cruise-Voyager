import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import createMemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { z } from "zod";
import { 
  loginSchema, 
  registerSchema, 
  insertBookingSchema,
  searchSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

const MemoryStore = createMemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "oceanview-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" },
      store: new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) return done(null, false, { message: "User not found" });
        if (user.password !== password) return done(null, false, { message: "Incorrect password" });
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication Routes
  app.post("/api/auth/login", (req, res, next) => {
    try {
      // Validate input
      const validatedData = loginSchema.parse(req.body);
      
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: info.message });
        
        req.logIn(user, (err) => {
          if (err) return next(err);
          return res.json({ 
            message: "Login successful", 
            user: { 
              id: user.id, 
              username: user.username, 
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName 
            } 
          });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.post("/api/auth/register", async (req, res, next) => {
    try {
      // Validate input
      const userData = registerSchema.parse(req.body);
      
      // Check if username exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Check if email exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }
      
      // Create new user
      const { confirmPassword, ...userDataWithoutConfirm } = userData;
      const newUser = await storage.createUser(userDataWithoutConfirm);
      
      // Log user in
      req.logIn(newUser, (err) => {
        if (err) return next(err);
        return res.status(201).json({ 
          message: "Registration successful", 
          user: { 
            id: newUser.id, 
            username: newUser.username, 
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName 
          } 
        });
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = req.user as any;
    return res.json({ 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName 
      } 
    });
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      return res.json({ message: "Logout successful" });
    });
  });

  // Destination Routes
  app.get("/api/destinations", async (_req, res, next) => {
    try {
      const destinations = await storage.getDestinations();
      res.json(destinations);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/destinations/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid destination ID" });
      }
      
      const destination = await storage.getDestination(id);
      if (!destination) {
        return res.status(404).json({ message: "Destination not found" });
      }
      
      res.json(destination);
    } catch (error) {
      next(error);
    }
  });

  // Cruise Routes
  app.get("/api/cruises", async (_req, res, next) => {
    try {
      const cruises = await storage.getCruises();
      res.json(cruises);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/cruises/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid cruise ID" });
      }
      
      const cruise = await storage.getCruise(id);
      if (!cruise) {
        return res.status(404).json({ message: "Cruise not found" });
      }
      
      res.json(cruise);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/cruises/destination/:destinationId", async (req, res, next) => {
    try {
      const destinationId = parseInt(req.params.destinationId);
      if (isNaN(destinationId)) {
        return res.status(400).json({ message: "Invalid destination ID" });
      }
      
      const cruises = await storage.getCruisesByDestination(destinationId);
      res.json(cruises);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/cruises/search", async (req, res, next) => {
    try {
      // Validate input
      const searchParams = searchSchema.parse(req.body);
      
      const cruises = await storage.searchCruises(searchParams);
      res.json(cruises);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  // Booking Routes
  app.get("/api/bookings", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = req.user as any;
      const bookings = await storage.getBookings(user.id);
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/bookings/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const user = req.user as any;
      if (booking.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to view this booking" });
      }
      
      res.json(booking);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/bookings", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Validate input
      const bookingData = insertBookingSchema.parse(req.body);
      
      const user = req.user as any;
      const newBooking = await storage.createBooking({
        ...bookingData,
        userId: user.id,
        bookingDate: new Date()
      });
      
      res.status(201).json({ message: "Booking created successfully", booking: newBooking });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.patch("/api/bookings/:id/status", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      const { status } = req.body;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const user = req.user as any;
      if (booking.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to update this booking" });
      }
      
      const updatedBooking = await storage.updateBookingStatus(id, status);
      res.json({ message: "Booking status updated", booking: updatedBooking });
    } catch (error) {
      next(error);
    }
  });

  // Amenity Routes
  app.get("/api/amenities", async (_req, res, next) => {
    try {
      const amenities = await storage.getAmenities();
      res.json(amenities);
    } catch (error) {
      next(error);
    }
  });

  // Testimonial Routes
  app.get("/api/testimonials", async (_req, res, next) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
