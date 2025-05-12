# Aurelia - AI-Powered Talent Agency for Creatives

Aurelia is a revolutionary AI-powered talent agency platform that connects beauty and lifestyle micro-influencers with brands, helping them grow their careers and secure meaningful collaborations.

## Project Overview

Aurelia empowers creators by:
- Matching creators with relevant brand opportunities using AI
- Managing creator-brand relationships and collaborations
- Providing data-driven insights and growth strategies
- Automating outreach and negotiation processes
- Building professional portfolios and media kits

## Key Features

- **AI-Powered Matching:** Intelligent algorithm to match creators with relevant brands
- **Portfolio Management:** Professional portfolio and media kit creation
- **Analytics Dashboard:** Track performance metrics and growth opportunities
- **Brand Collaboration Tools:** Streamline the entire collaboration process
- **Career Growth:** AI-driven insights and recommendations for career development

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
  - AI/ML integration for matching and recommendations

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/aurelia.git
cd aurelia

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

- **CreatorProfile.tsx**: Creator profile and portfolio management
- **BrandMatching.tsx**: AI-powered brand matching interface
- **Analytics.tsx**: Performance metrics and insights dashboard
- **CollaborationManager.tsx**: Brand collaboration workflow

## Database Schema

The application uses several main tables:
- `profiles`: Creator and brand profiles
- `opportunities`: Brand collaboration opportunities
- `collaborations`: Active and past brand partnerships
- `analytics`: Performance metrics and insights
- `matches`: AI-generated creator-brand matches

## Deployment

The project can be deployed to any static hosting service that supports React applications built with Vite.

## License

This project is private and not licensed for public use.

---

Created with ❤️ for the future of creator economy
