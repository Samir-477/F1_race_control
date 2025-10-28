# F1 Race Control - Quick Start Guide

## Running the Application

### Terminal 1 - Backend Server
```bash
cd c:/Users/samir/OneDrive/Desktop/f1_extended/F1_race_control/server
npm run dev
```
Server will run on: `http://localhost:3002`

### Terminal 2 - Frontend Client
```bash
cd c:/Users/samir/OneDrive/Desktop/f1_extended/F1_race_control
npm run dev
```
Frontend will run on: `http://localhost:3000`

## Login Credentials

### Admin Account
- Username: `admin@f1control.com`
- Password: `admin123`

### Steward Accounts
- Username: `steward1` / Password: `steward123`
- Username: `steward2` / Password: `steward123`

## Database Management

### Check Database Status
```bash
cd server
npm run db:status
```

### View Database in GUI
```bash
cd server
npm run db:studio
```
Opens at: `http://localhost:5555`

### Reset Database (Fresh Start)
```bash
cd server
npm run db:reset
```
⚠️ **WARNING:** This deletes all data!

### Seed Database Again
```bash
cd server
npm run seed
```

## Project Structure

```
F1_race_control/
├── client/                 # Frontend React app
│   ├── components/        # React components
│   ├── contexts/          # React contexts (Auth)
│   ├── data/             # Mock data
│   └── types.ts          # TypeScript types
├── server/                # Backend Express server
│   ├── prisma/           # Database schema & migrations
│   ├── src/              # Server source code
│   └── scripts/          # Setup scripts
├── public/               # Static assets (images)
└── package.json          # Frontend dependencies
```

## Common Tasks

### Install All Dependencies
```bash
# Root (frontend)
npm install

# Server (backend)
cd server
npm install
```

### Create New Database Migration
```bash
cd server
npm run db:migrate:dev
```

### Generate Prisma Client (after schema changes)
```bash
cd server
npm run generate
```

## Troubleshooting

### Server won't start
1. Check if MySQL is running
2. Verify `.env` file in `server/` folder
3. Run `npm run db:status` to check migrations

### Frontend shows blank page
1. Check browser console for errors
2. Verify backend is running on port 3002
3. Check if types are correct in `client/types.ts`

### Database errors
1. Check `server/.env` has correct DATABASE_URL
2. Ensure database `race_control` exists
3. Run `npm run db:reset` for fresh start

### Prisma Client errors
1. Stop the dev server
2. Run `npm run generate` in server folder
3. Restart dev server

## API Endpoints

Base URL: `http://localhost:3002`

- `POST /api/auth/login` - Login
- `GET /api/teams` - Get all teams
- `GET /api/drivers` - Get all drivers
- `GET /api/races` - Get all races
- `GET /api/circuits` - Get all circuits
- `POST /api/incidents` - Create incident (Steward)
- `POST /api/penalties` - Assign penalty (Steward)

## Development Workflow

1. **Start Backend**: `cd server && npm run dev`
2. **Start Frontend**: `npm run dev` (in root)
3. **Make Changes**: Edit files in `client/` or `server/src/`
4. **Test**: Open `http://localhost:3000`
5. **Database Changes**: 
   - Edit `server/prisma/schema.prisma`
   - Run `npm run db:migrate:dev`
   - Run `npm run generate`

## Need More Help?

- Backend Setup: See `server/DATABASE_SETUP.md`
- API Documentation: Check `server/src/routes/`
- Frontend Components: Check `client/components/`

## Features

### Admin Dashboard
- Manage teams and drivers
- View all races and results
- Monitor steward activities

### Steward Dashboard
- View live race data
- Report incidents
- Assign penalties
- Real-time race monitoring

### Landing Page
- View teams and drivers
- Browse race results
- Public race information
