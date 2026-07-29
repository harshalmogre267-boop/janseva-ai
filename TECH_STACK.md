# Tech Stack

## Core
- Next.js 16
- React 19
- TypeScript

## Styling & UI
- Tailwind CSS
- PostCSS
- Framer Motion
- Lucide React

## Data & Visualization
- Recharts

## Backend / Utilities
- Node.js via Next.js API routes
- Cheerio
- Nodemailer

## Development Tools
- ESLint
- TypeScript compiler
- Node type definitions
- React type definitions

## Deployment
- Vercel-friendly Next.js project

## Flow Diagram
```mermaid
flowchart TD
    A[User opens website] --> B[Landing Page]
    B --> C[Sign In / Auth]
    C --> D[Create or load user profile]
    D --> E[Eligibility & Scheme Matching]
    E --> F[Show recommended schemes]
    F --> G[User explores schemes / dashboard]
    G --> H[Chatbot / assistance]
    G --> I[Apply for schemes]
    H --> G

    subgraph Data
        J[Mock scheme data]
        K[User profile context]
        L[Translation context]
    end

    D --> K
    E --> J
    E --> K
    G --> L
```
