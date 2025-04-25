# GlowFolio - Media Kit Platform for Content Creators

GlowFolio is a modern web application that helps content creators showcase their work and metrics to potential brand partners through beautiful, customizable media kits.

## Project Overview

GlowFolio empowers creators to:
- Create professional media kits in minutes
- Customize colors, content, and layout
- Share their media kit via a personalized URL
- Display social media metrics and brand collaborations
- Present their work in a visually appealing format

## Key Features

- **Customizable Media Kits:** Choose from multiple color themes and layout options
- **Brand Collaboration Showcase:** Highlight past partnerships and brand work
- **Metrics Display:** Present follower count, engagement rates, and other key metrics
- **Services Section:** Showcase what services you offer to potential clients
- **Public Sharing:** Each media kit gets a dedicated public URL for easy sharing

## Technologies Used

This project is built with a modern tech stack:

- **Frontend:**
  - React 18 with TypeScript
  - Tailwind CSS for styling
  - shadcn/ui component library
  - Vite for fast development and building

- **Backend:**
  - Supabase for database, authentication, and storage
  - PostgreSQL database

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

```bash
# Clone the repository
git clone https://github.com/julianramey/glow-pitch-perfect.git
cd glowfolio

# Install dependencies
npm install

# Create a .env.local file with your Supabase credentials
echo "VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key" > .env.local

# Start the development server
npm run dev
```

## Project Structure

- `/src/components`: UI components
- `/src/pages`: Page components and routing
- `/src/lib`: Utilities, hooks, and context providers
- `/src/pages/api`: API handlers
- `/supabase`: Supabase configuration and migrations

## Key Components

- **MediaKit.tsx**: Main component for displaying media kits
- **MediaKitEditor.tsx**: Editor interface for customizing media kits
- **PublicMediaKit.tsx**: Public-facing view of a creator's media kit

## Database Schema

The application uses several main tables:
- `profiles`: User profiles and settings
- `media_kit_stats`: Performance metrics for different platforms
- `brand_collaborations`: Past brand partnerships 
- `services`: Services offered to potential clients
- `portfolio_items`: Portfolio showcase items

## Deployment

The project can be deployed to any static hosting service that supports React applications built with Vite.

## License

This project is private and not licensed for public use.

---

Created with ❤️ for content creators
