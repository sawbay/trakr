# Personal Finance Tracker

## Overview

This is a full-stack personal finance tracking application built with React, Express, and TypeScript. The application allows users to manage financial transactions, categorize expenses and income, view analytics, and import transactions using AI-powered text parsing. It features a mobile-first design with a clean, modern interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for development
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Style**: RESTful API with JSON responses
- **Validation**: Zod schemas shared between client and server

### Mobile-First Design
- Responsive design optimized for mobile devices
- Bottom navigation for mobile app-like experience
- Touch-friendly interactions and UI components

## Key Components

### Database Schema
- **Transactions Table**: Stores financial transactions with amount, description, category, type (income/expense), date
- **Categories Table**: Predefined categories with names, icons, and colors
- **Validation**: Drizzle-Zod integration for type-safe database operations

### API Endpoints
- `GET/POST /api/transactions` - Transaction CRUD operations
- `GET/PUT/DELETE /api/transactions/:id` - Individual transaction management
- `GET/POST /api/categories` - Category management
- `POST /api/ai-import` - AI-powered transaction import
- `GET /api/analytics/summary` - Financial analytics and summaries

### Core Features
1. **Transaction Management**: Add, edit, delete, and view financial transactions
2. **Categorization**: Organize transactions by predefined categories with icons and colors
3. **Analytics Dashboard**: Visual charts showing spending patterns and category breakdowns
4. **AI Import**: Parse natural language text to extract transaction data using OpenAI GPT-4
5. **Mobile Navigation**: Bottom tab navigation for seamless mobile experience

### Storage Layer
- **Interface**: IStorage interface for pluggable storage implementations
- **Current Implementation**: In-memory storage (MemStorage) for development
- **Production Ready**: Configured for PostgreSQL with Drizzle ORM
- **Migration Support**: Drizzle Kit for database schema migrations

## Data Flow

1. **Client Requests**: React components make API calls using TanStack Query
2. **API Processing**: Express routes handle requests, validate data with Zod schemas
3. **Database Operations**: Drizzle ORM performs type-safe database operations
4. **Response Handling**: JSON responses sent back to client
5. **UI Updates**: TanStack Query automatically updates UI with fresh data
6. **AI Integration**: OpenAI API processes natural language for transaction extraction

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm & drizzle-kit**: Type-safe ORM and migration tools
- **@tanstack/react-query**: Server state management
- **react-hook-form & @hookform/resolvers**: Form handling and validation
- **zod**: Schema validation and type inference
- **wouter**: Lightweight routing
- **date-fns**: Date manipulation utilities

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant styling
- **recharts**: Chart library for analytics
- **lucide-react**: Icon library

### AI Integration
- **OpenRouter API**: Integration with multiple AI models through unified API
- **Google Gemini Flash 1.5**: Free model used for both text and image processing
- **Text Processing**: Extracts structured transaction data from natural language descriptions
- **Image Processing**: OCR and transaction extraction from receipt images (JPEG/PNG support)
- **Multimodal Support**: Handles both text input and image uploads for transaction import

## Deployment Strategy

### Development
- **Vite Dev Server**: Hot module replacement and fast builds
- **TSX Runtime**: Direct TypeScript execution for server
- **Environment Variables**: DATABASE_URL and OPENAI_API_KEY required

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations ensure schema consistency
- **Deployment**: Single Node.js process serving both API and static files

### Configuration
- **TypeScript**: Strict type checking with path aliases for clean imports
- **Vite**: Configured with React plugin and development tools
- **Tailwind**: Custom theme with CSS variables for consistent styling
- **PostCSS**: Autoprefixer and Tailwind processing

The application is designed to be easily deployable on platforms like Replit, Vercel, Netlify, and other modern hosting platforms, with all necessary configuration files and a streamlined build process.

## Vercel Deployment

The project includes complete Vercel deployment configuration:

### Quick Deploy
```bash
./deploy.sh
```

### Manual Deploy
```bash
npm run build
npx vercel --prod
```

### Environment Variables (Optional)
- `OPENROUTER_API_KEY`: For AI-powered transaction import
- `DATABASE_URL`: PostgreSQL connection for persistent storage (uses in-memory storage if not provided)

### Configuration Files
- `vercel.json`: Vercel deployment configuration
- `DEPLOYMENT.md`: Complete deployment guide
- `deploy.sh`: Automated deployment script