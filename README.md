# Placelytics - Placement Readiness and Skill Gap Analytics System

A modern TypeScript monorepo for AI-powered full-stack development with React, Express, PostgreSQL, and scalable workspace tooling.

 Overview

Placelytics  is a powerful full-stack monorepo designed for rapid AI-enabled application development.
It combines:

 Express-based backend APIs
 React + Vite frontend applications
 Placelytics dashboard package
 Shared database layer with Drizzle ORM
 Tailwind CSS + Radix UI
 AI-ready scalable architecture

The repository uses pnpm workspaces for modular development and centralized dependency management.

🏗️ Monorepo Structure
Focus-AI/
│
├── packages/
│   ├── api-server/          # Express backend API
│   ├── mockup-sandbox/      # React/Vite UI playground
│   ├── placelytics/         # Placelytics dashboard app
│   └── shared/              # Shared types, schemas, utilities
│
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.json

🚀 Tech Stack
🔹 Backend
Node.js 24
Express 5
TypeScript
Drizzle ORM
PostgreSQL
pg-mem (fallback DB)

🔹 Frontend
React
Vite
Tailwind CSS
Radix UI
Recharts

🔹 Tooling
pnpm Workspaces
TypeScript 5.9
esbuild
Vite
ESLint
Shared workspace tooling

✨ Features
🔥 API Server
REST API architecture
Typed schema support
Shared validation layer
PostgreSQL database integration
In-memory database fallback using pg-mem

🎨 Mockup Sandbox
Rapid UI prototyping
Tailwind-based styling
Component preview system
Vite-powered development experience

📊 Placelytics Dashboard
Student dashboard workflows
Analytics visualizations
Modern React dashboard UI
Placement readiness system integration

🧠 Shared Workspace Architecture
Centralized TypeScript configuration
Shared dependencies
Reusable utilities and schemas
Consistent developer experience

📦 Installation
1️⃣ Clone Repository
git clone <repository-url>
cd Focus-AI
2️⃣ Install pnpm
npm install -g pnpm
3️⃣ Install Dependencies
pnpm install
⚙️ Optional Windows Native Dependencies

For better Windows compatibility, optional native binaries may be installed automatically.

If needed, install manually:

pnpm add -w \
@rollup/rollup-win32-x64-msvc \
lightningcss-win32-x64-msvc \
@tailwindcss/oxide-win32-x64-msvc \
--save-optional

🚀 Running the Project
▶️ Start API Server
pnpm --filter @workspace/api-server run dev

Runs the Express backend server.


▶️ Start Mockup Sandbox
pnpm --filter @workspace/mockup-sandbox run dev

Runs the Vite React playground.

▶️ Start Placelytics Dashboard
pnpm --filter @workspace/placelytics run dev

Runs the Placelytics frontend dashboard.

🏗️ Build Commands
Full Workspace Build
pnpm run build

This command:

Runs TypeScript type checking
Builds all packages with a build script
🧪 Type Checking
pnpm run typecheck

Performs centralized TypeScript validation across all workspace packages.

🗄️ Database

The backend supports:

PostgreSQL database connection
Automatic fallback using pg-mem

This allows development even without a live PostgreSQL server.

🌍 Environment Variables

Create a .env file where required.

Example:

DATABASE_URL=postgresql://user:password@localhost:5432/focusai

PORT=3000
BASE_PATH=/
🎨 UI Stack

The frontend uses:

Tailwind CSS
Radix UI
Recharts
React + Vite

Designed for:

Responsive layouts
Dashboard systems
Modern SaaS interfaces
📈 Future Scope

Planned future enhancements:

AI-powered recommendations
Real-time analytics
Authentication system
Redis caching
Cloud deployment
Advanced dashboarding
ML integrations
👨‍💻 Developer Experience

Focus-AI is optimized for:

Fast local development
Shared TypeScript tooling
Modular package architecture
Scalable frontend/backend workflows
📄 Scripts
Command	Description
pnpm install	Install dependencies
pnpm run build	Build entire workspace
pnpm run typecheck	Run TypeScript checks
pnpm --filter @workspace/api-server run dev	Start backend
pnpm --filter @workspace/mockup-sandbox run dev	Start sandbox
pnpm --filter @workspace/placelytics run dev	Start dashboard


📌 Notes
Built as a private development monorepo
Uses pnpm workspace architecture
Optimized for TypeScript-first development
Supports scalable frontend and backend applications
💡 Focus-AI Vision

Focus-AI aims to provide a modern foundation for:

AI-enabled products
Analytics dashboards
Full-stack SaaS applications
Rapid frontend/backend experimentation


Development  / Members
Apaar Mishra -  EN23CS301178
Ansh Mishra  -  EN23CS301153
Aprajita Singh - EN23CS301153
