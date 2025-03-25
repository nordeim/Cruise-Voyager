![image](https://github.com/user-attachments/assets/7266295b-1fa6-44f5-9b73-28c2d5664bd3)
![image](https://github.com/user-attachments/assets/f8142702-0046-493e-8dcd-5560b8044175)
![image](https://github.com/user-attachments/assets/237aca7d-e655-49e5-a159-d55ae24b93da)
![image](https://github.com/user-attachments/assets/d4c3da64-64e5-44d2-82a0-dac85b3d36c7)
![image](https://github.com/user-attachments/assets/319773f4-4d2a-4ed2-9d22-686c08ce78ac)
![image](https://github.com/user-attachments/assets/8338b6d5-3fe7-467c-a02a-451acdd2a89c)

---
# CruiseVoyager - Technical Design Overview
Last Updated: 2025-03-25 10:26:22 UTC
Author: nordeim

## 1. Executive Summary

CruiseVoyager is a modern cruise booking platform built with Next.js, Express.js, and PostgreSQL. The platform provides a seamless experience for users to search, compare, and book cruise packages while offering comprehensive management tools for administrators.

## 2. Technical Architecture

### 2.1 Technology Stack
```typescript
Frontend:
- Next.js with TypeScript
- React Query for state management
- Tailwind CSS for styling

Backend:
- Express.js with TypeScript
- PostgreSQL with Drizzle ORM
- Passport.js for authentication
- Vite for build tooling
```

### 2.2 Core System Components

```typescript
// High-level system architecture
Architecture/
├── Client Layer
│   ├── Next.js Frontend
│   ├── React Components
│   └── API Integration
├── Server Layer
│   ├── Express.js API
│   ├── Authentication Services
│   └── Business Logic
└── Data Layer
    ├── PostgreSQL Database
    ├── Drizzle ORM
    └── Data Models
```

## 3. Data Models and Relationships

### 3.1 Primary Entities

```typescript
// Core data models
export interface Cruise {
  id: number;
  title: string;
  description: string;
  destinationId: number;
  imageUrl: string;
  departureFrom: string;
  duration: number;
  pricePerPerson: number;
  cabinType: string;
  inclusions: string;
  isBestSeller: boolean;
  isNewItinerary: boolean;
  rating: number;
  availablePackages: string[];
  availableDates: Date[];
}

export interface Booking {
  id: number;
  userId: number;
  cruiseId: number;
  bookingDate: Date;
  departureDate: Date;
  returnDate: Date;
  totalPrice: number;
  numberOfGuests: number;
  cabinType: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  bookingReference: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profile: UserProfile;
  bookings: Booking[];
}
```

## 4. API Structure

### 4.1 Core Endpoints

```typescript
// Authentication
POST /api/auth/register    // User registration
POST /api/auth/login       // User login
POST /api/auth/logout      // User logout
GET  /api/auth/user       // Get current user

// Cruises
GET  /api/cruises         // List all cruises
GET  /api/cruises/:id     // Get cruise details
POST /api/cruises/search  // Search cruises
GET  /api/cruises/destination/:id // Get cruises by destination

// Bookings
POST /api/bookings        // Create booking
GET  /api/bookings        // List user bookings
GET  /api/bookings/:id    // Get booking details
PATCH /api/bookings/:id/status // Update booking status
```

## 5. Frontend Architecture

### 5.1 Component Structure

```typescript
// Key components organization
components/
├── Layout/
│   ├── Header
│   ├── Navigation
│   └── Footer
├── Cruise/
│   ├── CruiseCard
│   ├── CruiseList
│   └── CruiseDetails
├── Booking/
│   ├── BookingForm
│   └── BookingConfirmation
└── Shared/
    ├── Button
    ├── Input
    └── Modal
```

### 5.2 Design System

```typescript
// Core design tokens
export const theme = {
  colors: {
    primary: '#0066CC',    // Ocean Blue
    secondary: '#00CC99',  // Aqua
    accent: '#FFD700',     // Gold
    error: '#FF4444',
    success: '#00C851'
  },
  typography: {
    primary: '"Poppins", sans-serif',
    secondary: '"Playfair Display", serif'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  }
};
```

## 6. Key Features and Implementation

### 6.1 Authentication Flow

```typescript
// Authentication implementation
export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.token) {
      setAuthToken(response.token);
      return response.user;
    }
  },
  
  async register(userData: UserRegistration) {
    const response = await api.post('/auth/register', userData);
    if (response.success) {
      return this.login({
        username: userData.username,
        password: userData.password
      });
    }
  }
};
```

### 6.2 Booking Process

```typescript
// Booking flow implementation
export const bookingService = {
  async createBooking(bookingData: BookingCreate) {
    // Validate booking data
    const validated = validateBooking(bookingData);
    
    // Check availability
    const available = await checkAvailability(
      bookingData.cruiseId,
      bookingData.dates
    );
    
    if (!available) {
      throw new Error('Selected dates not available');
    }
    
    // Create booking
    const booking = await api.post('/bookings', validated);
    
    // Initialize payment
    return await paymentService.initialize(booking);
  }
};
```

## 7. Security Measures

### 7.1 Authentication Security

```typescript
// Security implementation
export const security = {
  // Password hashing
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },
  
  // Session configuration
  sessionConfig: {
    secret: process.env.SESSION_SECRET,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    },
    resave: false,
    saveUninitialized: false
  }
};
```

### 7.2 Data Protection

```typescript
// Data protection measures
export const dataProtection = {
  // Input sanitization
  sanitizeInput(input: any): any {
    return xss(input);
  },
  
  // Request rate limiting
  rateLimiter: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
};
```

## 8. Performance Optimization

```typescript
// Performance enhancements
export const performance = {
  // API response caching
  cacheConfig: {
    stdTTL: 600, // 10 minutes
    checkperiod: 120,
    routes: ['/api/cruises', '/api/destinations']
  },
  
  // Image optimization
  imageConfig: {
    formats: ['webp', 'avif'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  }
};
```

## 9. Deployment and Scaling

```typescript
// Deployment configuration
export const deployment = {
  // Environment configuration
  environments: {
    development: {
      apiUrl: 'http://localhost:3000',
      debug: true
    },
    production: {
      apiUrl: 'https://api.cruisevoyager.com',
      debug: false
    }
  },
  
  // Scaling strategy
  scaling: {
    minInstances: 2,
    maxInstances: 10,
    autoScaling: true
  }
};
```

## 10. Future Considerations

1. **Scalability Improvements**
   - Implement horizontal scaling
   - Add load balancing
   - Optimize database queries

2. **Feature Enhancements**
   - Real-time booking updates
   - Advanced search filters
   - Mobile application development

3. **Technical Debt Management**
   - Regular dependency updates
   - Code refactoring
   - Performance monitoring

This technical design overview provides a condensed yet comprehensive view of the CruiseVoyager platform's architecture and implementation. It serves as a quick reference for developers while maintaining the essential technical details needed for understanding and maintaining the system.

The document prioritizes clarity and practicality, focusing on the most critical aspects of the system while providing concrete code examples for key implementations. This overview can be used as a starting point for new team members and as a reference for existing developers.
