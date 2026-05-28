# QuoteSend Frontend — Next.js

Travel quotation management app for **Tourist Leader**.

## Tech Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Axios** — API calls with auto token refresh
- **React Hook Form + Zod** — form validation
- **Lucide React** — icons

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
```
Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://api.thedigitaldyno.in:8081
```

### 3. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 4. Build for production
```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── (auth)/          # Login, Register, Forgot Password
│   └── (dashboard)/     # Dashboard, Quotes, Emails, Profile
├── components/
│   ├── ui/              # Button, Input, Modal, Badge, Toast...
│   ├── layout/          # Sidebar
│   ├── quote/           # QuoteForm, QuotePreview, CalendarPicker, CostModal, DayRow
│   └── dashboard/       # StatCard, RecentTable
├── context/             # AuthContext, ToastContext
├── hooks/               # useAuth, useToast, useImageUpload
├── lib/                 # axios.ts (instance + interceptors), utils.ts
├── services/            # auth, quote, email, dashboard, image
├── types/               # All TypeScript interfaces from BE API
└── constants/           # Cost categories, status colors, brand colors
```

## Key Features

### Authentication
- JWT with auto-refresh (401 → refresh → retry → redirect to /login)
- Tokens stored in localStorage

### Quote Form
- Split layout: form (left 500px) | live preview (right, sticky)
- Custom 2-month date range calendar picker
- Auto-generates day rows when dates are selected
- Cost modal with 13 predefined travel categories
- Day rows: location, hotel (multi-line), photo upload to S3, sightseeing
- Live preview renders Travel ITINERARY design

### PDF Download
- Calls `GET /api/v1/quotes/{id}/pdf` (server-generated)
- Also supports FE print via `Download PDF` button (window.open print)

### Known Limitations
- **Forgot Password** — endpoint not yet in BE, shows "coming soon"
- **Change Password** — endpoint not yet in BE, shows "coming soon"
- **Pagination** — BE currently returns List[], FE filters client-side
- **Search** — client-side filter until BE adds `/quotes/search` endpoint

## API Base URL
`http://api.thedigitaldyno.in:8081`

## Brand Colors
- Navy: `#0F2050`
- Gold: `#C9A84C`
- Teal (preview): `#1A5B6A`
