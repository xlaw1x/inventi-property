# Property Manager Web App

A production-ready Property Management system built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Dashboard**: KPI cards, charts, and high-priority ticket management
- **Ticket Management**: Create, track, and manage maintenance requests
- **Tenant Overview**: Unit summaries with activity tracking
- **Announcements**: Markdown-based tenant communication system
- **Responsive Design**: Mobile-first approach with collapsible navigation
- **Demo Authentication**: Simple credential-based login for hackathons

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React
- **Data Fetching**: SWR with optimistic updates
- **Charts**: Recharts
- **Validation**: Zod schemas

## Getting Started

### Prerequisites

- Node.js 18+ 
- FastAPI backend running (optional for demo)

### Installation

1. Clone and install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up environment variables:
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edit `.env.local` with your configuration:
\`\`\`env
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_DEMO_EMAIL=manager@example.com
NEXT_PUBLIC_DEMO_PASSWORD=QWERTY12345!
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Integration

The app integrates with a FastAPI backend with the following endpoints:

### Maintenance Tickets
- `GET /maintenance?status=...` - List tickets
- `PATCH /maintenance/{id}/status` - Update ticket status
- `POST /maintenance/room` - Create room ticket (multipart/form-data)
- `POST /maintenance/building` - Create building ticket (multipart/form-data)

### Incidents (Optional)
- `GET /incidents?severity=...` - List incidents

### Service Requests
- `GET /service?svc_type=visitor|delivery&status=...` - List service requests

## Authentication

Demo authentication is implemented for hackathon/demo purposes:

1. Navigate to `/login`
2. Use credentials from environment variables
3. Session stored in HttpOnly cookie (24h expiration)
4. Middleware protects all routes except `/login` and public announcements

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Manual Build

\`\`\`bash
npm run build
npm start
\`\`\`

## Project Structure

\`\`\`
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── login/             # Authentication
│   └── announcements/     # Public announcements
├── components/            # Reusable UI components
│   ├── layout/           # Navigation and layout
│   ├── tickets/          # Ticket management
│   ├── announcements/    # Announcement editor
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities and API
│   ├── api.ts           # API client and error handling
│   ├── hooks.ts         # SWR data fetching hooks
│   └── utils.ts         # Utility functions
├── types/               # TypeScript type definitions
└── middleware.ts        # Route protection
\`\`\`

## Key Features

### Responsive Design
- Mobile-first approach
- Collapsible sidebar navigation
- Horizontal scroll for tables on mobile
- Touch-friendly interactions

### Data Management
- SWR for caching and revalidation
- Optimistic updates for better UX
- Automatic retry logic with exponential backoff
- Real-time data refresh

### Error Handling
- Graceful API error handling
- Toast notifications for user feedback
- Fallback UI for connection issues
- Retry mechanisms for failed requests

### Accessibility
- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader friendly

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE` | FastAPI backend URL | `http://localhost:8000` |
| `NEXT_PUBLIC_DEMO_EMAIL` | Demo login email | `manager@example.com` |
| `NEXT_PUBLIC_DEMO_PASSWORD` | Demo login password | `QWERTY12345!` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
