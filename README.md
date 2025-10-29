# F1 Race Control Application

A comprehensive Formula 1 race management system with team management, steward administration, and race control features.

## Features

- **Team Management**: Create and manage F1 teams with drivers, cars, and sponsors
- **Steward Management**: Admin interface for managing race stewards
- **Race Management**: Create races with circuit and season selection
- **Authentication**: Role-based access control (Admin/Steward)
- **Real-time Updates**: Live data synchronization between frontend and backend

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT tokens

## Prerequisites

- Node.js (v18 or higher)
- MySQL database

## Quick Start

1. **Install all dependencies:**

   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**

   - Copy `.env.example` to `server/.env`
   - Update database connection string in `server/.env`

3. **Set up the database:**

   ```bash
   cd server
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Run both client and server:**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Runs both client and server concurrently
- `npm run dev:client` - Runs only the frontend (port 3000)
- `npm run dev:server` - Runs only the backend (port 3002)
- `npm run install:all` - Installs dependencies for all projects

## Default Login Credentials

- **Admin**: `admin@f1control.com` / `admin123`
- **Steward**: `steward1` / `steward123`

## API Endpoints

- **Authentication**: `POST /auth/login`, `POST /auth/register`
- **Teams**: `GET /api/teams`, `POST /api/teams`, `PUT /api/teams/:id`
- **Stewards**: `GET /api/stewards`, `POST /api/stewards`
- **Races**: `GET /api/races`, `POST /api/races`
- **Circuits**: `GET /api/circuits`
- **Seasons**: `GET /api/seasons`

## Project Structure

```
├── client/          # React frontend
├── server/          # Node.js backend
├── package.json     # Root package.json with dev scripts
└── README.md
```
