import { 
  users, type User, type InsertUser,
  destinations, type Destination, type InsertDestination,
  cruises, type Cruise, type InsertCruise,
  bookings, type Booking, type InsertBooking,
  amenities, type Amenity, type InsertAmenity,
  testimonials, type Testimonial, type InsertTestimonial,
  enquiries, type Enquiry, type InsertEnquiry,
  enquiryResponses, type EnquiryResponse, type InsertEnquiryResponse,
  cabinTypes, type CabinType, type InsertCabinType,
  payments, type Payment, type InsertPayment
} from "@shared/schema";
import { randomUUID } from "crypto";
import { createHash } from "crypto";
import { DB_URL } from "./config";
import pkg from "pg";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  updateUserPassword(id: number, password: string): Promise<User | undefined>;
  updateUserLastLogin(id: number): Promise<User | undefined>;
  createPasswordResetToken(email: string): Promise<string | undefined>;
  resetPassword(token: string, password: string): Promise<boolean>;
  
  // Destination methods
  getDestinations(): Promise<Destination[]>;
  getDestination(id: number): Promise<Destination | undefined>;
  createDestination(destination: InsertDestination): Promise<Destination>;
  
  // Cruise methods
  getCruises(): Promise<Cruise[]>;
  getCruise(id: number): Promise<Cruise | undefined>;
  getCruisesByDestination(destinationId: number): Promise<Cruise[]>;
  createCruise(cruise: InsertCruise): Promise<Cruise>;
  searchCruises(params: any): Promise<Cruise[]>;

  // Cabin Types methods
  getCabinTypes(cruiseId: number): Promise<CabinType[]>;
  getCabinType(id: number): Promise<CabinType | undefined>;
  createCabinType(cabinType: InsertCabinType): Promise<CabinType>;

  // Booking methods
  getBookings(userId: number): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingByReference(reference: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  cancelBooking(id: number, reason?: string): Promise<Booking | undefined>;
  
  // Payment methods
  getPayments(bookingId: number): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string): Promise<Payment | undefined>;
  
  // Amenity methods
  getAmenities(): Promise<Amenity[]>;
  getAmenity(id: number): Promise<Amenity | undefined>;
  createAmenity(amenity: InsertAmenity): Promise<Amenity>;
  
  // Testimonial methods
  getTestimonials(): Promise<Testimonial[]>;
  getTestimonialsByCruise(cruiseId: number): Promise<Testimonial[]>;
  getTestimonial(id: number): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  verifyTestimonial(id: number): Promise<Testimonial | undefined>;

  // Enquiry methods (Contact Us)
  getEnquiries(): Promise<Enquiry[]>;
  getEnquiriesByUser(userId: number): Promise<Enquiry[]>;
  getEnquiry(id: number): Promise<Enquiry | undefined>;
  createEnquiry(enquiry: InsertEnquiry): Promise<Enquiry>;
  updateEnquiryStatus(id: number, status: string): Promise<Enquiry | undefined>;
  assignEnquiry(id: number, userId: number): Promise<Enquiry | undefined>;
  
  // Enquiry Response methods
  getEnquiryResponses(enquiryId: number): Promise<EnquiryResponse[]>;
  createEnquiryResponse(response: InsertEnquiryResponse): Promise<EnquiryResponse>;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private destinationsData: Map<number, Destination>;
  private cruisesData: Map<number, Cruise>;
  private bookingsData: Map<number, Booking>;
  private amenitiesData: Map<number, Amenity>;
  private testimonialsData: Map<number, Testimonial>;
  private cabinTypesData: Map<number, CabinType>;
  private paymentsData: Map<number, Payment>;
  private enquiriesData: Map<number, Enquiry>;
  private enquiryResponsesData: Map<number, EnquiryResponse>;
  
  private currentUserIds: number;
  private currentDestinationIds: number;
  private currentCruiseIds: number;
  private currentBookingIds: number;
  private currentAmenityIds: number;
  private currentTestimonialIds: number;
  private currentCabinTypeIds: number;
  private currentPaymentIds: number;
  private currentEnquiryIds: number;
  private currentEnquiryResponseIds: number;

  constructor() {
    this.usersData = new Map();
    this.destinationsData = new Map();
    this.cruisesData = new Map();
    this.bookingsData = new Map();
    this.amenitiesData = new Map();
    this.testimonialsData = new Map();
    this.cabinTypesData = new Map();
    this.paymentsData = new Map();
    this.enquiriesData = new Map();
    this.enquiryResponsesData = new Map();
    
    this.currentUserIds = 1;
    this.currentDestinationIds = 1;
    this.currentCruiseIds = 1;
    this.currentBookingIds = 1;
    this.currentAmenityIds = 1;
    this.currentTestimonialIds = 1;
    this.currentCabinTypeIds = 1;
    this.currentPaymentIds = 1;
    this.currentEnquiryIds = 1;
    this.currentEnquiryResponseIds = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserIds++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now,
      updatedAt: now,
      lastLogin: null,
      isVerified: false,
      resetToken: null,
      resetTokenExpiry: null
    };
    this.usersData.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.usersData.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { 
      ...existingUser, 
      ...userData,
      updatedAt: new Date()
    };
    this.usersData.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserPassword(id: number, password: string): Promise<User | undefined> {
    const existingUser = this.usersData.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { 
      ...existingUser, 
      password,
      updatedAt: new Date(),
      resetToken: null,
      resetTokenExpiry: null
    };
    this.usersData.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserLastLogin(id: number): Promise<User | undefined> {
    const existingUser = this.usersData.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { 
      ...existingUser, 
      lastLogin: new Date()
    };
    this.usersData.set(id, updatedUser);
    return updatedUser;
  }
  
  async createPasswordResetToken(email: string): Promise<string | undefined> {
    const user = await this.getUserByEmail(email);
    if (!user) return undefined;
    
    const token = randomUUID();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 2); // Token valid for 2 hours
    
    const updatedUser = { 
      ...user, 
      resetToken: token,
      resetTokenExpiry: expiry,
      updatedAt: new Date()
    };
    this.usersData.set(user.id, updatedUser);
    return token;
  }
  
  async resetPassword(token: string, password: string): Promise<boolean> {
    const user = Array.from(this.usersData.values()).find(
      (user) => user.resetToken === token && 
                user.resetTokenExpiry && 
                user.resetTokenExpiry > new Date()
    );
    
    if (!user) return false;
    
    const updatedUser = { 
      ...user, 
      password,
      resetToken: null,
      resetTokenExpiry: null,
      updatedAt: new Date()
    };
    this.usersData.set(user.id, updatedUser);
    return true;
  }

  // Destination methods
  async getDestinations(): Promise<Destination[]> {
    return Array.from(this.destinationsData.values());
  }
  
  async getDestination(id: number): Promise<Destination | undefined> {
    return this.destinationsData.get(id);
  }
  
  async createDestination(destination: InsertDestination): Promise<Destination> {
    const id = this.currentDestinationIds++;
    const newDestination: Destination = { ...destination, id };
    this.destinationsData.set(id, newDestination);
    return newDestination;
  }

  // Cruise methods
  async getCruises(): Promise<Cruise[]> {
    return Array.from(this.cruisesData.values());
  }
  
  async getCruise(id: number): Promise<Cruise | undefined> {
    return this.cruisesData.get(id);
  }
  
  async getCruisesByDestination(destinationId: number): Promise<Cruise[]> {
    return Array.from(this.cruisesData.values()).filter(
      (cruise) => cruise.destinationId === destinationId
    );
  }
  
  async createCruise(cruise: InsertCruise): Promise<Cruise> {
    const id = this.currentCruiseIds++;
    const newCruise: Cruise = { 
      ...cruise, 
      id,
      availableDates: cruise.availableDates || null
    };
    this.cruisesData.set(id, newCruise);
    return newCruise;
  }
  
  // Cabin Types methods
  async getCabinTypes(cruiseId: number): Promise<CabinType[]> {
    return Array.from(this.cabinTypesData.values()).filter(
      cabin => cabin.cruiseId === cruiseId
    );
  }
  
  async getCabinType(id: number): Promise<CabinType | undefined> {
    return this.cabinTypesData.get(id);
  }
  
  async createCabinType(cabinType: InsertCabinType): Promise<CabinType> {
    const id = this.currentCabinTypeIds++;
    const newCabinType: CabinType = {
      ...cabinType,
      id,
      amenities: cabinType.amenities || null
    };
    this.cabinTypesData.set(id, newCabinType);
    return newCabinType;
  }
  
  async searchCruises(params: any): Promise<Cruise[]> {
    let results = Array.from(this.cruisesData.values());
    
    if (params.destination && params.destination !== "Any Destination") {
      const destination = Array.from(this.destinationsData.values()).find(
        d => d.name === params.destination
      );
      if (destination) {
        results = results.filter(cruise => cruise.destinationId === destination.id);
      }
    }
    
    if (params.duration && params.duration !== "Any Length") {
      // Handle duration filtering
      switch(params.duration) {
        case "2-5 Days":
          results = results.filter(cruise => cruise.duration >= 2 && cruise.duration <= 5);
          break;
        case "6-9 Days":
          results = results.filter(cruise => cruise.duration >= 6 && cruise.duration <= 9);
          break;
        case "10+ Days":
          results = results.filter(cruise => cruise.duration >= 10);
          break;
      }
    }
    
    return results;
  }

  // Booking methods
  async getBookings(userId: number): Promise<Booking[]> {
    return Array.from(this.bookingsData.values()).filter(
      (booking) => booking.userId === userId
    );
  }
  
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookingsData.get(id);
  }
  
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingIds++;
    const newBooking: Booking = { 
      ...booking, 
      id,
      bookingDate: new Date() 
    };
    this.bookingsData.set(id, newBooking);
    return newBooking;
  }
  
  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const existingBooking = this.bookingsData.get(id);
    if (!existingBooking) return undefined;
    
    const updatedBooking = { ...existingBooking, status };
    this.bookingsData.set(id, updatedBooking);
    return updatedBooking;
  }

  // Amenity methods
  async getAmenities(): Promise<Amenity[]> {
    return Array.from(this.amenitiesData.values());
  }
  
  async getAmenity(id: number): Promise<Amenity | undefined> {
    return this.amenitiesData.get(id);
  }
  
  async createAmenity(amenity: InsertAmenity): Promise<Amenity> {
    const id = this.currentAmenityIds++;
    const newAmenity: Amenity = { ...amenity, id };
    this.amenitiesData.set(id, newAmenity);
    return newAmenity;
  }

  // Testimonial methods
  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonialsData.values());
  }
  
  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    return this.testimonialsData.get(id);
  }
  
  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.currentTestimonialIds++;
    const newTestimonial: Testimonial = { ...testimonial, id };
    this.testimonialsData.set(id, newTestimonial);
    return newTestimonial;
  }

  // Initialize with sample data
  private initSampleData() {
    // Sample destinations
    const destinations: InsertDestination[] = [
      {
        name: "Caribbean",
        description: "Explore crystal-clear waters, white sandy beaches, and vibrant island cultures.",
        imageUrl: "https://images.unsplash.com/photo-1590523741831-ab7e8b8334b4",
        priceFrom: 599,
        rating: 4.5,
        cruiseCount: 12,
        durationRange: "7-10 Days"
      },
      {
        name: "Mediterranean",
        description: "Visit ancient ruins, coastal villages, and enjoy delicious cuisine across Europe.",
        imageUrl: "https://images.unsplash.com/photo-1602867741746-6df80f40c267",
        priceFrom: 899,
        rating: 5.0,
        cruiseCount: 15,
        durationRange: "10-14 Days"
      },
      {
        name: "Alaska",
        description: "Experience breathtaking glaciers, wildlife sightings, and magnificent landscapes.",
        imageUrl: "https://images.unsplash.com/photo-1473181488821-2d23949a045a",
        priceFrom: 799,
        rating: 4.5,
        cruiseCount: 8,
        durationRange: "7-14 Days"
      },
      {
        name: "Europe",
        description: "Discover historic cities, cultural landmarks, and beautiful countryside.",
        imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a",
        priceFrom: 999,
        rating: 4.8,
        cruiseCount: 10,
        durationRange: "10-14 Days"
      },
      {
        name: "Asia",
        description: "Experience diverse cultures, ancient temples, and exotic cuisine.",
        imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
        priceFrom: 1099,
        rating: 4.7,
        cruiseCount: 6,
        durationRange: "12-18 Days"
      },
      {
        name: "Australia",
        description: "Explore the Great Barrier Reef, scenic coastlines, and vibrant cities.",
        imageUrl: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be",
        priceFrom: 1299,
        rating: 4.6,
        cruiseCount: 5,
        durationRange: "10-16 Days"
      }
    ];
    
    destinations.forEach(destination => {
      this.createDestination(destination);
    });

    // Sample cruises
    const cruises: InsertCruise[] = [
      {
        title: "Caribbean Paradise",
        description: "7-Night Western Caribbean & Perfect Day",
        destinationId: 1, // Caribbean
        imageUrl: "https://images.unsplash.com/photo-1548574505-5e239809ee19",
        departureFrom: "Miami, FL",
        duration: 7,
        pricePerPerson: 899,
        originalPrice: 1199,
        cabinType: "Ocean View Stateroom",
        inclusions: "All meals, Entertainment, Port charges",
        isBestSeller: true,
        isNewItinerary: false,
        rating: 4.5,
        availablePackages: ["Premium Dining Package", "$200 Onboard Credit"]
      },
      {
        title: "Greek Isles Explorer",
        description: "10-Night Greek Isles & Mediterranean Journey",
        destinationId: 2, // Mediterranean
        imageUrl: "https://images.unsplash.com/photo-1612456144614-8f2ebcc7bb40",
        departureFrom: "Rome, Italy",
        duration: 10,
        pricePerPerson: 1499,
        originalPrice: 1799,
        cabinType: "Balcony Stateroom",
        inclusions: "All meals, Entertainment, Port charges",
        isBestSeller: false,
        isNewItinerary: true,
        rating: 5.0,
        availablePackages: ["Specialty Dining (3 meals)", "Shore Excursion Credit", "Drink Package"]
      },
      {
        title: "Alaskan Adventure",
        description: "7-Night Glacier Experience",
        destinationId: 3, // Alaska
        imageUrl: "https://images.unsplash.com/photo-1531253450048-8e5e6a1d5db3",
        departureFrom: "Seattle, WA",
        duration: 7,
        pricePerPerson: 1099,
        originalPrice: 1399,
        cabinType: "Balcony Stateroom",
        inclusions: "All meals, Entertainment, Port charges",
        isBestSeller: true,
        isNewItinerary: false,
        rating: 4.7,
        availablePackages: ["Wildlife Excursion Package", "Premium Beverage Package"]
      },
      {
        title: "European Capitals",
        description: "12-Night Tour of Historic Cities",
        destinationId: 4, // Europe
        imageUrl: "https://images.unsplash.com/photo-1502920514313-52581002a659",
        departureFrom: "Southampton, UK",
        duration: 12,
        pricePerPerson: 1799,
        originalPrice: 2199,
        cabinType: "Deluxe Balcony",
        inclusions: "All meals, Entertainment, Port charges",
        isBestSeller: false,
        isNewItinerary: true,
        rating: 4.8,
        availablePackages: ["City Tours Bundle", "Fine Dining Experience"]
      }
    ];
    
    cruises.forEach(cruise => {
      this.createCruise(cruise);
    });

    // Sample amenities
    const amenities: InsertAmenity[] = [
      {
        name: "Gourmet Dining",
        description: "Savor exquisite cuisine prepared by world-class chefs in our specialty restaurants, with dishes inspired by global destinations.",
        imageUrl: "https://images.unsplash.com/photo-1593069567131-53a0614df2ea"
      },
      {
        name: "World-Class Entertainment",
        description: "Enjoy Broadway-style shows, live music, comedy performances, and themed parties throughout your cruise vacation.",
        imageUrl: "https://images.unsplash.com/photo-1591456983933-0cda86bbfec9"
      },
      {
        name: "Rejuvenating Spa",
        description: "Relax and refresh with our comprehensive spa treatments, thermal suites, and expert therapists for the ultimate relaxation.",
        imageUrl: "https://images.unsplash.com/photo-1610641818989-575305921886"
      },
      {
        name: "Adventure Activities",
        description: "Experience thrilling rock climbing walls, water slides, zip lines and more for adrenaline seekers of all ages.",
        imageUrl: "https://images.unsplash.com/photo-1566438480900-0609be27a4be"
      },
      {
        name: "Family-Friendly Zones",
        description: "Dedicated areas for children and teens with age-appropriate activities, games, and supervised programs.",
        imageUrl: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b"
      },
      {
        name: "Luxury Shopping",
        description: "Browse high-end boutiques and duty-free shops featuring designer brands, jewelry, and exclusive souvenirs.",
        imageUrl: "https://images.unsplash.com/photo-1607083206968-13611e3d76db"
      }
    ];
    
    amenities.forEach(amenity => {
      this.createAmenity(amenity);
    });

    // Sample testimonials
    const testimonials: InsertTestimonial[] = [
      {
        name: "Robert J.",
        cruiseName: "Caribbean Paradise Cruise",
        comment: "Our Caribbean cruise exceeded all expectations. The staff was incredible, the food was amazing, and the excursions were unforgettable. Already planning our next trip!",
        rating: 5,
        avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce"
      },
      {
        name: "Jennifer M.",
        cruiseName: "Greek Isles Explorer",
        comment: "The Mediterranean cruise was the perfect family vacation. My kids loved the onboard activities, and my husband and I enjoyed the entertainment and shore excursions. Truly memorable!",
        rating: 5,
        avatarUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f"
      },
      {
        name: "Lisa & David T.",
        cruiseName: "Alaska Adventure",
        comment: "As first-time cruisers, we were amazed by how smooth the entire experience was. The booking process was easy, and the onboard service was top-notch. Definitely recommend OceanView!",
        rating: 4,
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
      }
    ];
    
    testimonials.forEach(testimonial => {
      this.createTestimonial(testimonial);
    });
  }
}

export const storage = new MemStorage();
