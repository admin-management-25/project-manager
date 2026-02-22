# Vault — Freelance Credential Manager

A secure, full-stack credential management system built for freelancers to manage project credentials for their clients.

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Full-stack, server components, API routes in one project |
| **Database** | MongoDB + Mongoose | Flexible schema, embedded documents fit project→user→cred hierarchy |
| **Auth** | NextAuth.js v4 (credentials) | Simple, secure, JWT-based |
| **Encryption** | CryptoJS AES | Credentials encrypted at rest before DB storage |
| **Validation** | Zod | Type-safe input validation |
| **Styling** | Tailwind CSS + custom CSS vars | Dark theme, design system |
| **Language** | TypeScript | End-to-end type safety |

## Architecture: Repository Pattern

```
Request → API Route → Service → Repository → MongoDB
                ↑ Zod validation
                       ↑ Business logic
                                ↑ Data access + encryption
```

### Layers

```
src/
├── repositories/        # Data access layer
│   ├── base.repository.ts     # Generic CRUD interface
│   ├── owner.repository.ts    # Auth/user persistence
│   └── project.repository.ts  # Projects + users + credentials
├── services/            # Business logic layer
│   ├── auth.service.ts        # Register, validate
│   └── project.service.ts     # Project/user/cred operations
├── models/              # Mongoose schemas
│   ├── Owner.ts
│   └── Project.ts       # Embedded: users → credentials
├── app/api/             # Next.js API routes (thin controllers)
│   ├── auth/            # NextAuth + register
│   └── projects/        # CRUD for projects, users, credentials
├── components/          # React UI
│   ├── layout/          # Sidebar
│   └── projects/        # ProjectsClient, ProjectDetailClient, Modals
└── types/index.ts       # Shared TypeScript interfaces
```

## Data Model

```
Owner (auth user)
└── Projects []
    ├── name, clientName, description, status, color, tags
    └── Users [] (embedded)
        ├── name, email, role
        └── Credentials [] (embedded, encrypted)
            ├── key, type, label, description
            ├── value (AES encrypted)
            ├── expiresAt, lastRotatedAt
            └── needsRotation (flag for periodic rotation)
```

## Features

- **Projects** — Create, edit, archive, delete projects with color coding and tags
- **Users** — Multiple users per project, each with their own credential set
- **Credentials** — MongoDB URLs, API keys, secrets, tokens, passwords, custom
- **Security** — AES encryption for all credential values at rest
- **Reveal** — Click to reveal/hide credentials on demand
- **Copy** — One-click copy to clipboard (fetches decrypted on-demand)
- **Rotation** — Flag credentials needing rotation, update values
- **Expiry** — Set expiry dates on credentials
- **Dashboard** — Stats overview: active projects, total users, credentials, rotation alerts

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in:
```env
MONGODB_URI=mongodb://localhost:27017/freelance-creds
NEXTAUTH_SECRET=any-long-random-string
NEXTAUTH_URL=http://localhost:3000
ENCRYPTION_KEY=exactly-32-characters-here!!!!!!
```

> **Important:** `ENCRYPTION_KEY` must be kept secret. If lost, all stored credentials cannot be decrypted.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), register an account, and start adding projects.

## API Reference

```
POST   /api/auth/register                                    Register
POST   /api/auth/[...nextauth]                               Login (NextAuth)

GET    /api/projects                                         List projects
POST   /api/projects                                         Create project
GET    /api/projects/:id                                     Get project
PATCH  /api/projects/:id                                     Update project
DELETE /api/projects/:id                                     Delete project

POST   /api/projects/:id/users                               Add user
PATCH  /api/projects/:id/users/:uid                          Update user
DELETE /api/projects/:id/users/:uid                          Delete user

POST   /api/projects/:id/users/:uid/credentials              Add credential
PATCH  /api/projects/:id/users/:uid/credentials/:cid         Update / reveal / rotate
DELETE /api/projects/:id/users/:uid/credentials/:cid         Delete credential
```

### Reveal credential
```js
PATCH /api/projects/:id/users/:uid/credentials/:cid
{ "action": "reveal" }
// Returns: { value: "decrypted-value" }
```

### Rotate credential
```js
PATCH /api/projects/:id/users/:uid/credentials/:cid
{ "action": "rotate", "newValue": "new-secret-value" }
```

## Security Notes

1. All credential values are AES-256 encrypted before storing in MongoDB
2. Decryption only happens server-side via API action
3. The `ENCRYPTION_KEY` env var must be kept secret and backed up
4. Passwords are hashed with bcrypt (12 rounds)
5. All routes protected by NextAuth JWT session
6. The UI never receives raw encrypted blobs — value field is always `"[encrypted]"` in API responses except on explicit reveal
