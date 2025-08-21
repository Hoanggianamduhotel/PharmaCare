# Overview

This is a Vietnamese pharmacy management system built with React, Express, and Supabase PostgreSQL. The application provides comprehensive functionality for managing medicine inventory, prescriptions, and patient records. It features a modern UI with Shadcn/UI components, TanStack Query for data fetching, and real-time prescription processing capabilities.

## Recent Changes (Aug 20, 2025)
- ✅ Successfully migrated to real Supabase database with table `thuoc`
- ✅ Fixed medicine creation logic - can now add new medicines via API and UI
- ✅ Updated schema to match SQL table structure (numeric fields for pricing)
- ✅ Improved table UI with soft gray colors and full-width layout
- ✅ Dual API support: Vietnamese `/api/thuoc` and legacy `/api/medicines` routes

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React SPA**: Uses Vite as the build tool with TypeScript support
- **UI Framework**: Shadcn/UI components built on Radix UI primitives with Tailwind CSS styling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and data fetching
- **Form Handling**: React Hook Form with Zod schema validation
- **Theme System**: Custom theme provider supporting light/dark modes

## Backend Architecture
- **Express.js Server**: RESTful API with TypeScript
- **Database Layer**: Drizzle ORM for type-safe database operations
- **Schema Design**: Five main entities (users, medicines, patients, prescriptions, prescription_medicines)
- **API Structure**: Organized with `/api` prefix for all endpoints
- **Error Handling**: Centralized error middleware with proper HTTP status codes

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM provides type-safe queries and schema management
- **Migration System**: Drizzle Kit handles database migrations
- **Schema**: Relational design with proper foreign key relationships between prescriptions, patients, and medicines

## Key Features
- **Medicine Inventory Management**: CRUD operations for medicines with stock tracking
- **Prescription Processing**: Complete prescription workflow from creation to fulfillment
- **Patient Records**: Patient management with prescription history
- **Real-time Statistics**: Dashboard with inventory alerts and prescription status tracking
- **Responsive Design**: Mobile-first approach with adaptive layouts

## External Dependencies

- **Database**: Neon PostgreSQL (serverless)
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tools**: Vite for development and production builds
- **Development**: Replit integration with runtime error overlay
- **Font Loading**: Google Fonts (DM Sans, Geist Mono, Architects Daughter, Fira Code)