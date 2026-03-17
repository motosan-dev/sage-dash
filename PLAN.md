# Sage Dash — Implementation Plan

Dashboard template for Sage Agent. Uses `@motosan/sage-ui` components.  
Vite + React + Tailwind + shadcn/ui.

## Architecture

```
sage-dash (this template)
    │
    │ imports
    ▼
@motosan/sage-ui (npm library)
    │
    │ fetches
    ▼
sage-agent /api/v1/* (Rust backend)
```

## Usage

```bash
# Clone template
npx degit motosan-dev/sage-dash my-dashboard
cd my-dashboard
npm install

# Configure
echo "VITE_API_URL=http://localhost:8080" > .env

# Run
npm run dev
# → http://localhost:3000
```

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | KPI cards, pipeline overview, pending actions |
| Pipeline | `/pipeline` | Kanban board (drag & drop) |
| Clients | `/clients` | Client list (search, filter, sort) |
| Client Detail | `/clients/:id` | Profile + timeline + docs + payments |
| Quotes | `/quotes` | Quote list + create new |
| Quote Detail | `/quotes/:id` | Quote items + send to LINE |
| Settings | `/settings` | Pipeline config, team, integrations |

## Project Structure

```
sage-dash/
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── components.json              ← shadcn config
├── .env.example                 ← VITE_API_URL=http://localhost:8080
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── router.tsx               ← react-router-dom
│   │
│   ├── layouts/
│   │   ├── root-layout.tsx      ← sidebar + header + main
│   │   └── sidebar.tsx          ← navigation
│   │
│   ├── pages/
│   │   ├── dashboard.tsx        ← StatGrid + pipeline mini + pending
│   │   ├── pipeline.tsx         ← PipelineBoard
│   │   ├── clients.tsx          ← ClientTable
│   │   ├── client-detail.tsx    ← tabs: profile, timeline, docs, payments
│   │   ├── quotes.tsx           ← quote list
│   │   ├── quote-detail.tsx     ← QuoteBuilder
│   │   └── settings.tsx         ← config display
│   │
│   ├── components/              ← page-specific components (not in sage-ui)
│   │   ├── ui/                  ← shadcn primitives
│   │   ├── sidebar-nav.tsx
│   │   └── page-header.tsx
│   │
│   └── lib/
│       └── config.ts            ← VITE_API_URL reader
│
├── public/
├── Dockerfile                   ← nginx serve
└── README.md
```

## Page Details

### Dashboard (`/`)
```
┌──────────────────────────────────────────────┐
│  StatGrid (4 cards)                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│
│  │ 活躍    │ │ 本月成交│ │ 待收款  │ │ 逾期    ││
│  │ 客戶    │ │        │ │        │ │ 文件    ││
│  └────────┘ └────────┘ └────────┘ └────────┘│
│                                              │
│  Pipeline Overview          Pending Actions  │
│  ┌──────────────────┐  ┌──────────────────┐ │
│  │ mini pipeline    │  │ 3 quotes expiring│ │
│  │ distribution bar │  │ 5 docs overdue   │ │
│  │                  │  │ 2 payments due   │ │
│  └──────────────────┘  └──────────────────┘ │
└──────────────────────────────────────────────┘
```

### Client Detail (`/clients/:id`)
```
┌──────────────────────────────────────────────┐
│  Client Name              Stage: [Select ▾]  │
│  LINE: @xxx | Email: xxx  Source: LINE       │
│                                              │
│  ┌─────┬──────┬──────┬────────┐              │
│  │ 資料 │ 時間軸│ 文件  │ 收款   │  ← Tabs     │
│  └─────┴──────┴──────┴────────┘              │
│                                              │
│  [Tab Content]                               │
│  資料 → DynamicForm (custom_fields)          │
│  時間軸 → ClientTimeline                      │
│  文件 → DocChecklist                          │
│  收款 → PaymentTracker                        │
└──────────────────────────────────────────────┘
```

## Sidebar Navigation

```
┌──────────────────┐
│  🧙 Sage Agent   │
│                  │
│  📊 Dashboard    │
│  📋 Pipeline     │
│  👥 Clients      │
│  💰 Quotes       │
│  ⚙️  Settings    │
│                  │
│                  │
│  ──────────────  │
│  v0.1.0          │
└──────────────────┘
```

## Dependencies

```json
{
  "dependencies": {
    "@motosan/sage-ui": "^0.1.0",
    "react": "^19",
    "react-dom": "^19",
    "react-router-dom": "^7"
  },
  "devDependencies": {
    "vite": "^6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

## Deployment

### Vercel
```bash
npm run build
# Deploy dist/ to Vercel
# Set VITE_API_URL in Vercel env vars
```

### Docker (nginx)
```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

---

## Implementation Phases

### Phase 1 — Layout + Dashboard (v0.1)
- [ ] Vite + React + Tailwind + shadcn setup
- [ ] Root layout (sidebar + header)
- [ ] Router setup
- [ ] Dashboard page (StatGrid + pipeline mini)
- [ ] Connect to sage-agent /api/v1/analytics

**Done when:** Dashboard page renders with real data from backend

### Phase 2 — Pipeline + Clients (v0.2)
- [ ] Pipeline page (PipelineBoard from sage-ui)
- [ ] Clients page (ClientTable from sage-ui)
- [ ] Client detail page (DynamicForm + ClientTimeline)
- [ ] Create client dialog

**Done when:** Full client lifecycle visible in dashboard

### Phase 3 — Business (v0.3)
- [ ] Client detail: documents tab (DocChecklist)
- [ ] Client detail: payments tab (PaymentTracker)
- [ ] Quotes page (list + create)
- [ ] Quote detail page (QuoteBuilder)
- [ ] Send quote to LINE button

**Done when:** Complete business workflow in dashboard

### Phase 4 — Polish (v0.4)
- [ ] Settings page
- [ ] Dark mode
- [ ] Responsive sidebar (mobile collapse)
- [ ] Loading states + error handling
- [ ] Dockerfile + nginx.conf
- [ ] README quickstart

**Done when:** Production-deployable dashboard template
