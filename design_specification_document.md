\<think\>
1. First, I need to thoroughly understand the [codebase structure](https://github.com/jeremiahwongyip/CruiseVoyager/) and components. I'll use semantic code search to get a high-level overview of the project architecture.

2. I should examine:
- Main application structure and routing
- UI components and their relationships
- Data models and state management
- API integration points
- Styling and theming approach
- Key functionalities and user flows

3. I'll need to:
- Search for key Next.js configuration files
- Look for component definitions
- Analyze styling patterns
- Review API integrations
- Understand the booking flow
- Examine user interaction patterns

Let me start with a semantic search to understand the project structure.
</think>

<think>Let me analyze the repository structure and create a comprehensive technical design document for the CruiseVoyager project. I'll break this down into several sections:

1. Project Overview and Architecture
2. Database Schema and Data Models
3. Backend API Design
4. Frontend Components and Pages
5. Authentication & Authorization
6. Features and User Flows
7. UI/UX Design System
8. Technical Implementation Details

From the code I've reviewed so far, this is a modern Next.js/TypeScript project with a well-structured backend using Express and PostgreSQL. The schema shows it's a sophisticated cruise booking platform with features like user management, cruise listings, bookings, payments, and customer support. Let me craft a detailed technical specification that captures all these aspects.  
\<\/think\>

# CruiseVoyager - Technical Design Specification

## 1. Project Overview and Architecture

### 1.1 System Architecture

CruiseVoyager is built as a modern web application using the following technology stack:

- **Frontend**: Next.js with TypeScript
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom authentication system with Passport.js
- **State Management**: React Query (inferred from modern Next.js practices)
- **Build Tool**: Vite
- **API Style**: RESTful API

The application follows a three-tier architecture:
1. Presentation Layer (Next.js Frontend)
2. Application Layer (Express.js Backend)
3. Data Layer (PostgreSQL Database)

### 1.2 Key Technical Decisions

- **TypeScript**: Ensures type safety across the entire application stack
- **PostgreSQL**: Chosen for robust relational data handling and JSON capabilities
- **Vite**: Used for fast development experience and optimal production builds
- **Custom Authentication**: Implemented using Passport.js for flexible auth strategies
- **RESTful API**: Clear separation of concerns and stateless communication

## 2. Database Schema and Data Models

### 2.1 Core Entities

```typescript
// Key Database Tables and Relationships

1. Users
- id: serial (PK)
- username: text
- email: text
- password: text (hashed)
- firstName: text
- lastName: text
- profile data fields

2. Cruises
- id: serial (PK)
- title: text
- description: text
- destinationId: integer (FK)
- imageUrl: text
- departureFrom: text
- duration: integer
- pricePerPerson: integer
- cabinType: text
- inclusions: text
- features: boolean flags

3. Bookings
- id: serial (PK)
- userId: integer (FK)
- cruiseId: integer (FK)
- cabinTypeId: integer (FK)
- bookingDate: timestamp
- departureDate: date
- returnDate: date
- totalPrice: integer
- status: enum
- paymentStatus: enum

4. Payments
- id: serial (PK)
- bookingId: integer (FK)
- amount: integer
- status: enum
- paymentMethod: enum
- transactionDetails: json
```

### 2.2 Supporting Entities

```typescript
1. Destinations
- id: serial (PK)
- name: text
- description: text
- imageUrl: text

2. CabinTypes
- id: serial (PK)
- cruiseId: integer (FK)
- name: text
- description: text
- priceModifier: integer
- capacity: integer
- amenities: text[]

3. Testimonials
- id: serial (PK)
- userId: integer (FK)
- cruiseId: integer (FK)
- rating: integer
- comment: text
- isVerified: boolean

4. Enquiries
- id: serial (PK)
- userId: integer (FK)
- subject: text
- message: text
- status: enum
```

## 3. Backend API Design

### 3.1 Authentication Endpoints

```typescript
POST /api/auth/register
- Register new user
- Body: { username, email, password, firstName, lastName }
- Returns: User object with JWT token

POST /api/auth/login
- Authenticate user
- Body: { username, password }
- Returns: User object with JWT token

POST /api/auth/logout
- End user session
- Returns: Success message

GET /api/auth/user
- Get current user details
- Returns: User object
```

### 3.2 Cruise Management Endpoints

```typescript
GET /api/cruises
- List all cruises
- Query params: { destination, dateRange, priceRange }
- Returns: Cruise[] 

GET /api/cruises/:id
- Get cruise details
- Returns: Detailed Cruise object

GET /api/cruises/destination/:destinationId
- Get cruises by destination
- Returns: Cruise[]

POST /api/cruises/search
- Search cruises
- Body: { destination, dates, passengers, priceRange }
- Returns: Cruise[]
```

### 3.3 Booking Endpoints

```typescript
POST /api/bookings
- Create new booking
- Body: { cruiseId, cabinTypeId, dates, passengers }
- Returns: Booking object

GET /api/bookings
- List user's bookings
- Returns: Booking[]

GET /api/bookings/:id
- Get booking details
- Returns: Detailed Booking object

PATCH /api/bookings/:id/status
- Update booking status
- Body: { status }
- Returns: Updated Booking object
```

## 4. Frontend Components and Pages

### 4.1 Page Structure

```typescript
pages/
├── index.tsx                 // Homepage
├── cruises/
│   ├── index.tsx            // Cruise listings
│   ├── [id].tsx            // Cruise details
│   └── search.tsx          // Search results
├── bookings/
│   ├── index.tsx           // User's bookings
│   ├── [id].tsx           // Booking details
│   └── new.tsx            // New booking form
├── account/
│   ├── profile.tsx         // User profile
│   ├── settings.tsx        // Account settings
│   └── payments.tsx        // Payment history
└── auth/
    ├── login.tsx           // Login page
    ├── register.tsx        // Registration page
    └── forgot-password.tsx // Password recovery
```

### 4.2 Core Components

```typescript
components/
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Navigation.tsx
│   └── Layout.tsx
├── cruise/
│   ├── CruiseCard.tsx
│   ├── CruiseDetails.tsx
│   ├── CruiseSearch.tsx
│   └── CruiseFilters.tsx
├── booking/
│   ├── BookingForm.tsx
│   ├── BookingTimeline.tsx
│   ├── PaymentSection.tsx
│   └── BookingSummary.tsx
└── shared/
    ├── Button.tsx
    ├── Input.tsx
    ├── Modal.tsx
    └── Loading.tsx
```

## 5. UI/UX Design System

### 5.1 Color Palette

```typescript
export const colors = {
  primary: {
    main: '#0066CC',     // Ocean Blue
    light: '#3399FF',
    dark: '#004C99'
  },
  secondary: {
    main: '#00CC99',     // Aqua
    light: '#33FFB3',
    dark: '#009973'
  },
  accent: {
    gold: '#FFD700',     // Luxury Gold
    coral: '#FF7F50'     // Coral Highlight
  },
  neutral: {
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    gray: '#808080',
    darkGray: '#333333',
    black: '#000000'
  }
}
```

### 5.2 Typography

```typescript
export const typography = {
  fontFamily: {
    primary: '"Poppins", sans-serif',
    secondary: '"Playfair Display", serif'
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem' // 30px
  }
}
```

### 5.3 Component Library

```typescript
// Button Variants
export const buttonStyles = {
  primary: `
    bg-primary-main
    hover:bg-primary-dark
    text-white
    font-semibold
    py-2
    px-4
    rounded-lg
  `,
  secondary: `
    bg-secondary-main
    hover:bg-secondary-dark
    text-white
    font-semibold
    py-2
    px-4
    rounded-lg
  `,
  outline: `
    border-2
    border-primary-main
    text-primary-main
    hover:bg-primary-main
    hover:text-white
    font-semibold
    py-2
    px-4
    rounded-lg
  `
}

// Card Styles
export const cardStyles = `
  bg-white
  rounded-xl
  shadow-md
  overflow-hidden
  transition-transform
  duration-300
  hover:transform
  hover:scale-105
`
```

## 6. Features and User Flows

### 6.1 Cruise Search and Booking Flow

1. **Search Cruises**
   - Enter destination, dates, passengers
   - Apply filters (price, duration, cabin type)
   - View search results with sorting options

2. **Cruise Selection**
   - View cruise details
   - Check cabin availability
   - Review pricing and inclusions
   - Read testimonials

3. **Booking Process**
   - Select cabin type
   - Enter passenger details
   - Choose add-ons and special requests
   - Review booking summary

4. **Payment Flow**
   - Select payment method
   - Enter payment details
   - Process payment
   - Receive confirmation

### 6.2 User Account Management

1. **Registration Flow**
   - Enter personal details
   - Email verification
   - Complete profile

2. **Profile Management**
   - Update personal information
   - View booking history
   - Manage preferences
   - Handle payments

### 6.3 Administrative Features

1. **Cruise Management**
   - Add/Edit cruise listings
   - Manage availability
   - Update pricing
   - Handle special offers

2. **Booking Management**
   - View all bookings
   - Process refunds
   - Handle modifications
   - Manage cancellations

## 7. Security Implementation

### 7.1 Authentication Security

```typescript
// Password Hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Session Management
app.use(session({
  store: new PgSession({
    pool,
    tableName: "session",
  }),
  secret: APP_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: process.env.NODE_ENV === "production"
  }
}));
```

### 7.2 API Security

```typescript
// Authentication Middleware
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Request Validation
export const bookingValidator = {
  body: z.object({
    cruiseId: z.number(),
    cabinTypeId: z.number(),
    passengers: z.array(z.object({
      firstName: z.string(),
      lastName: z.string(),
      dob: z.string()
    })),
    specialRequests: z.string().optional()
  })
};
```

## 8. Performance Optimization

### 8.1 Frontend Optimization

```typescript
// Image Optimization
export const ImageComponent = ({ src, alt }: ImageProps) => (
  <Image
    src={src}
    alt={alt}
    width={800}
    height={600}
    loading="lazy"
    placeholder="blur"
    blurDataURL={generateBlurHash(src)}
  />
);

// API Data Caching
export const useCruises = () => {
  return useQuery(['cruises'], fetchCruises, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000 // 30 minutes
  });
};
```

### 8.2 Backend Optimization

```typescript
// Query Optimization
export const getCruiseWithDetails = async (id: number) => {
  return await db.query(`
    SELECT 
      c.*,
      json_agg(DISTINCT ct.*) as cabin_types,
      json_agg(DISTINCT t.*) as testimonials
    FROM cruises c
    LEFT JOIN cabin_types ct ON ct.cruise_id = c.id
    LEFT JOIN testimonials t ON t.cruise_id = c.id
    WHERE c.id = $1
    GROUP BY c.id
  `, [id]);
};

// Response Caching
app.use(cacheMiddleware({
  routes: ['/api/cruises', '/api/destinations'],
  duration: '5 minutes'
}));
```

This technical design specification provides a comprehensive blueprint for the CruiseVoyager platform. It covers all major aspects of the application from architecture to implementation details, ensuring a consistent and maintainable codebase. The design emphasizes user experience, performance, and security while maintaining flexibility for future enhancements.

Additional considerations for implementation:
1. Implement proper error handling and logging
2. Set up monitoring and analytics
3. Configure CI/CD pipelines
4. Establish backup and recovery procedures
5. Create comprehensive documentation
6. Plan for scalability and load balancing

Would you like me to elaborate on any specific aspect of this technical design specification?
