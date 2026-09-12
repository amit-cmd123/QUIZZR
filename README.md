# Quizzr ⚡ - Realtime Multiplayer Quiz Platform

Quizzr is a premium, real-time multiplayer gaming quiz platform built to support live interactive rooms. It features low-latency socket communication, speed-based bonus scoring, an automated tab-switching anti-cheat detection engine, and high-fidelity analytics reporting.

Use the custom halftone dark blue gaming theme background throughout the application for a highly polished experience.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React + Vite (TypeScript)
- **Styling**: Tailwind CSS v3
- **Animations**: Framer Motion
- **Charts**: Recharts (for analytics dashboards)
- **Icons**: Lucide React
- **Realtime Client**: Socket.io-client

### Backend
- **Server**: Node.js + Express.js
- **Language**: TypeScript
- **Realtime Server**: Socket.io
- **Database ORM**: Prisma Client
- **Authentication**: JWT + bcryptjs
- **Database**: PostgreSQL (Prisma adapter)

---

## 📂 Project Structure

```
summer-project/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Prisma database schema definition
│   │   └── seed.ts            # Seeding script with dummy quizzes & hosts
│   ├── src/
│   │   ├── controllers/       # REST API endpoint business logic
│   │   │   ├── analyticsController.ts
│   │   │   ├── authController.ts
│   │   │   ├── quizController.ts
│   │   │   └── roomController.ts
│   │   ├── middleware/        # JWT route protectors
│   │   ├── routes/            # REST endpoint configurations
│   │   ├── socket/            # Real-time Socket.io game logic
│   │   │   └── socketHandler.ts
│   │   ├── utils/             # Prisma client instances
│   │   └── index.ts           # Backend entrypoint
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   │   └── bg-halftone.png    # Halftone design background image
│   ├── src/
│   │   ├── assets/
│   │   ├── components/        # Reusable global layout elements
│   │   │   ├── Navbar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/           # React context engines
│   │   │   ├── AuthContext.tsx
│   │   │   └── SocketContext.tsx
│   │   ├── pages/             # Layout screen views
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   ├── HostDashboard.tsx
│   │   │   ├── QuizBuilder.tsx
│   │   │   ├── PlayerJoin.tsx
│   │   │   ├── RoomLobby.tsx
│   │   │   ├── LiveQuiz.tsx
│   │   │   ├── FinalResults.tsx
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   └── SessionHistory.tsx
│   │   ├── services/          # REST Axios client base
│   │   │   └── api.ts
│   │   ├── App.tsx            # Main router
│   │   ├── index.css          # CSS styles & glassmorphic classes
│   │   └── main.tsx           # Dom mount point
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## ⚙️ Setup & Installation Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A running PostgreSQL database instance (or a Neon/Supabase PostgreSQL connection string)

---

### 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root of the `backend` folder:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://username:password@host:port/database_name?schema=public"
   JWT_SECRET="quizzr-secret-key-super-secret-99999"
   FRONTEND_URL="http://localhost:5173"
   ```

4. **Run Database Migrations**:
   Run the Prisma migration to map the schema tables directly to your PostgreSQL instance:
   ```bash
   npx prisma db push
   ```

5. **Seed Default Data**:
   Populate the database with a default host user (`host_demo`) and two mock quizzes:
   ```bash
   npm run prisma:seed
   ```
   > **Seed Credentials**:
   > - **Username**: `host_demo`
   > - **Email**: `host@quizzr.com`
   > - **Password**: `password123`

6. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The backend server will spin up on [http://localhost:5000](http://localhost:5000).

---

### 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root of the `frontend` folder:
   ```env
   VITE_BACKEND_URL="http://localhost:5000"
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The frontend app will launch on [http://localhost:5173](http://localhost:5173).

---

## 🎮 Game Engine Features

### ⏱️ Speed-Adjusted Scoring Algorithm
Answering correctly awards base points + a time bonus. The faster a player locks in their correct response, the higher the bonus:
$$\text{Score} = \text{Base Points} \times \left(1 + \left( \frac{\text{Time Left}}{\text{Total Question Duration}} \right) \times 0.5 \right)$$
- If a player answers instantly: they get up to $1.5\times$ base points.
- If a player answers right as the timer hits zero: they get $1.0\times$ base points.
- Incorrect answers award $0$ points.

### 🛡️ Tab-Switching Active Warning Shield
- The game client binds to window focus/blur (`visibilitychange` and `blur` events).
- If a player switches browser tabs or minimizes the window during a live question, the frontend sends a `detect-tab-switch` event to the server.
- The server updates the player's warning count in real-time, increments it in the database, and pushes a socket warning notice directly to the host's screen.
