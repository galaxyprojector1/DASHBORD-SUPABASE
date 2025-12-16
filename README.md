# Dashboard Supabase

Dashboard project with Supabase integration.

## Tech Stack

- **Frontend**: React / Next.js
- **Backend**: Supabase
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
├── src/
│   ├── app/           # Next.js App Router
│   ├── components/    # Reusable components
│   ├── lib/           # Utilities & API clients
│   ├── hooks/         # Custom React hooks
│   └── types/         # TypeScript types
├── public/            # Static assets
└── supabase/          # Supabase migrations & config
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment

Deploy to Vercel:

```bash
vercel
```

## License

MIT
