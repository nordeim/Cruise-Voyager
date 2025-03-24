import { pgTable, text, serial, integer, boolean, date, doublePrecision, jsonb, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending", 
  "confirmed", 
  "completed", 
  "cancelled"
]);

export const enquiryStatusEnum = pgEnum("enquiry_status", [
  "submitted", 
  "in_review", 
  "responded", 
  "closed"
]);

export const cabinTypeEnum = pgEnum("cabin_type", [
  "Interior", 
  "Ocean View Stateroom", 
  "Balcony Stateroom", 
  "Suite"
]);

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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
  isVerified: boolean("is_verified").default(false),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
});

// Users relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  enquiries: many(enquiries),
}));

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

// Destinations relations
export const destinationsRelations = relations(destinations, ({ many }) => ({
  cruises: many(cruises),
}));

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
  availableDates: date("available_dates").array(),
});

// Cruises relations
export const cruisesRelations = relations(cruises, ({ one, many }) => ({
  destination: one(destinations, {
    fields: [cruises.destinationId],
    references: [destinations.id],
  }),
  bookings: many(bookings),
}));

// Cabin Types table
export const cabinTypes = pgTable("cabin_types", {
  id: serial("id").primaryKey(),
  cruiseId: integer("cruise_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  priceModifier: integer("price_modifier").notNull().default(0),
  capacity: integer("capacity").notNull(),
  amenities: text("amenities").array(),
  imageUrl: text("image_url"),
});

// Cabin Types relations
export const cabinTypesRelations = relations(cabinTypes, ({ one }) => ({
  cruise: one(cruises, {
    fields: [cabinTypes.cruiseId],
    references: [cruises.id],
  }),
}));

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cruiseId: integer("cruise_id").notNull(),
  bookingDate: timestamp("booking_date").defaultNow().notNull(),
  departureDate: date("departure_date").notNull(),
  totalPrice: integer("total_price").notNull(),
  numberOfGuests: integer("number_of_guests").notNull(),
  cabinType: text("cabin_type").notNull(),
  guestDetails: jsonb("guest_details").notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
  paymentId: text("payment_id"),
  paymentStatus: text("payment_status"),
  specialRequests: text("special_requests"),
  bookingReference: text("booking_reference"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Bookings relations
export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  cruise: one(cruises, {
    fields: [bookings.cruiseId],
    references: [cruises.id],
  }),
}));

// Amenities table
export const amenities = pgTable("amenities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category"),
});

// Testimonials table
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cruiseName: text("cruise_name").notNull(),
  comment: text("comment").notNull(),
  rating: integer("rating").notNull(),
  avatarUrl: text("avatar_url"),
  cruiseId: integer("cruise_id"),
  userId: integer("user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isVerified: boolean("is_verified").default(false),
});

// Testimonials relations
export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  cruise: one(cruises, {
    fields: [testimonials.cruiseId],
    references: [cruises.id],
  }),
  user: one(users, {
    fields: [testimonials.userId],
    references: [users.id],
  }),
}));

// Customer Enquiries (Contact Us)
export const enquiries = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: enquiryStatusEnum("status").default("submitted").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  assignedToUserId: integer("assigned_to_user_id"),
  userId: integer("user_id"),
});

// Enquiries relations
export const enquiriesRelations = relations(enquiries, ({ one, many }) => ({
  user: one(users, {
    fields: [enquiries.userId],
    references: [users.id],
  }),
  responses: many(enquiryResponses),
}));

// Enquiry Responses
export const enquiryResponses = pgTable("enquiry_responses", {
  id: serial("id").primaryKey(),
  enquiryId: integer("enquiry_id").notNull(),
  responseText: text("response_text").notNull(),
  respondedByUserId: integer("responded_by_user_id"),
  respondedAt: timestamp("responded_at").defaultNow().notNull(),
});

// Enquiry responses relations
export const enquiryResponsesRelations = relations(enquiryResponses, ({ one }) => ({
  enquiry: one(enquiries, {
    fields: [enquiryResponses.enquiryId],
    references: [enquiries.id],
  }),
}));

// Payment Information
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").default("USD").notNull(),
  status: text("status").notNull(),
  paymentMethod: text("payment_method").notNull(),
  transactionId: text("transaction_id"),
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
  billingAddress: jsonb("billing_address"),
});

// Payment relations
export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));

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
  updatedAt: true,
  bookingReference: true,
});
export const insertAmenitySchema = createInsertSchema(amenities);
export const insertTestimonialSchema = createInsertSchema(testimonials);
export const insertEnquirySchema = createInsertSchema(enquiries).omit({
  createdAt: true,
  updatedAt: true,
  status: true,
});
export const insertEnquiryResponseSchema = createInsertSchema(enquiryResponses).omit({
  respondedAt: true,
});
export const insertCabinTypeSchema = createInsertSchema(cabinTypes);
export const insertPaymentSchema = createInsertSchema(payments).omit({
  paymentDate: true,
});

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

// Contact form schema
export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: z.string().email("Valid email is required"),
});

// Password reset schema
export const passwordResetSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Payment schema
export const paymentSchema = z.object({
  cardNumber: z.string().min(16, "Card number must be at least 16 digits").max(16, "Card number must be at most 16 digits"),
  cardName: z.string().min(1, "Cardholder name is required"),
  expiryDate: z.string().min(5, "Expiry date is required").max(5, "Invalid expiry date"),
  cvv: z.string().min(3, "CVV must be at least 3 digits").max(4, "CVV must be at most 4 digits"),
  billingAddress: z.string().min(1, "Billing address is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
});

// Booking cancellation schema
export const bookingCancellationSchema = z.object({
  bookingId: z.number().int().positive(),
  reason: z.string().optional(),
});

// Strongly typed interfaces
export type User = typeof users.$inferSelect;
export type Destination = typeof destinations.$inferSelect;
export type Cruise = typeof cruises.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Amenity = typeof amenities.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type EnquiryResponse = typeof enquiryResponses.$inferSelect;
export type CabinType = typeof cabinTypes.$inferSelect;
export type Payment = typeof payments.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type InsertCruise = z.infer<typeof insertCruiseSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertAmenity = z.infer<typeof insertAmenitySchema>;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type InsertEnquiry = z.infer<typeof insertEnquirySchema>;
export type InsertEnquiryResponse = z.infer<typeof insertEnquiryResponseSchema>;
export type InsertCabinType = z.infer<typeof insertCabinTypeSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type LoginCredentials = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type SearchData = z.infer<typeof searchSchema>;
export type ContactData = z.infer<typeof contactSchema>;
export type PasswordResetRequestData = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;
export type PaymentData = z.infer<typeof paymentSchema>;
export type BookingCancellationData = z.infer<typeof bookingCancellationSchema>;
