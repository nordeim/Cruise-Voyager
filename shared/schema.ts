import { pgTable, text, serial, integer, boolean, date, doublePrecision, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
});

// Destinations table
export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  priceFrom: integer("price_from").notNull(),
  rating: doublePrecision("rating").notNull(),
  cruiseCount: integer("cruise_count").notNull(),
  durationRange: text("duration_range").notNull(),
});

// Cruises table
export const cruises = pgTable("cruises", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  destinationId: integer("destination_id").notNull(),
  imageUrl: text("image_url").notNull(),
  departureFrom: text("departure_from").notNull(),
  duration: integer("duration").notNull(),
  pricePerPerson: integer("price_per_person").notNull(),
  originalPrice: integer("original_price"),
  cabinType: text("cabin_type").notNull(),
  inclusions: text("inclusions").notNull(),
  isBestSeller: boolean("is_best_seller").default(false),
  isNewItinerary: boolean("is_new_itinerary").default(false),
  rating: doublePrecision("rating").notNull(),
  availablePackages: text("available_packages").array().notNull(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cruiseId: integer("cruise_id").notNull(),
  bookingDate: timestamp("booking_date").notNull(),
  departureDate: date("departure_date").notNull(),
  totalPrice: integer("total_price").notNull(),
  numberOfGuests: integer("number_of_guests").notNull(),
  cabinType: text("cabin_type").notNull(),
  guestDetails: jsonb("guest_details").notNull(),
  status: text("status").notNull(),
});

// Amenities table
export const amenities = pgTable("amenities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
});

// Testimonials table
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cruiseName: text("cruise_name").notNull(),
  comment: text("comment").notNull(),
  rating: integer("rating").notNull(),
  avatarUrl: text("avatar_url"),
});

// Zod schemas for data validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  phone: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  country: true,
});

export const insertDestinationSchema = createInsertSchema(destinations);
export const insertCruiseSchema = createInsertSchema(cruises);
export const insertBookingSchema = createInsertSchema(bookings).omit({
  bookingDate: true,
});
export const insertAmenitySchema = createInsertSchema(amenities);
export const insertTestimonialSchema = createInsertSchema(testimonials);

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration schema with additional validation
export const registerSchema = insertUserSchema.extend({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Search schema for cruise search
export const searchSchema = z.object({
  destination: z.string().optional(),
  departureDate: z.string().optional(),
  duration: z.string().optional(),
  travelers: z.string().optional(),
});

// Strongly typed interfaces
export type User = typeof users.$inferSelect;
export type Destination = typeof destinations.$inferSelect;
export type Cruise = typeof cruises.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Amenity = typeof amenities.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type InsertCruise = z.infer<typeof insertCruiseSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertAmenity = z.infer<typeof insertAmenitySchema>;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

export type LoginCredentials = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type SearchData = z.infer<typeof searchSchema>;
