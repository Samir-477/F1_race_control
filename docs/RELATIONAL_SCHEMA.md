# 📊 F1 Race Control - Relational Schema

## Simple Relational Schema Notation

---

## 🔵 Team & Driver Management

### **Team**
```
Team(id PK, name UNIQUE, fullName, description, base, teamChief, color)
```

### **Driver**
```
Driver(id PK, teamId FK → Team, name, number, nationality, points, podiums, worldChampionships, imageUrl)
UNIQUE(teamId, number)
```

### **Car**
```
Car(id PK, teamId FK → Team UNIQUE, model, engine, chassis)
```

### **Sponsor**
```
Sponsor(id PK, name UNIQUE)
```

### **TeamSponsor** (Many-to-Many)
```
_TeamSponsors(A FK → Sponsor, B FK → Team)
PRIMARY KEY(A, B)
```

---

## 🟡 Season & Circuit

### **Season**
```
Season(id PK, year UNIQUE, name, isActive)
```

### **Circuit**
```
Circuit(id PK, name UNIQUE, location, country, length, laps)
```

---

## 🟣 Race Management

### **Race**
```
Race(id PK, circuitId FK → Circuit, seasonId FK → Season, reviewedById FK → User, 
     name, date, status, isReviewed, reviewedAt)
```

### **RaceParticipation** (Many-to-Many)
```
RaceParticipation(id PK, raceId FK → Race, teamId FK → Team)
UNIQUE(raceId, teamId)
```

### **RaceLog**
```
RaceLog(id PK, raceId FK → Race, driverId FK → Driver OPTIONAL, teamId FK → Team OPTIONAL,
        lap, timestamp, description, severity)
```

---

## 🔴 Race Results & Incidents

### **RaceResult**
```
RaceResult(id PK, raceId FK → Race, driverId FK → Driver, teamId FK → Team,
           position, time, points, penalty, fastestLap)
UNIQUE(raceId, driverId)
```

### **RaceIncident**
```
RaceIncident(id PK, raceId FK → Race, driverId FK → Driver, penaltyId FK → Penalty OPTIONAL,
             lap, description)
```

### **Penalty**
```
Penalty(id PK, type, value)
```

---

## 🟢 User Management

### **User**
```
User(id PK, username UNIQUE, password, role)
```

---

## 📋 Relationships Summary

### **One-to-One (1:1)**
- Team ↔ Car
- RaceIncident ↔ Penalty (optional)

### **One-to-Many (1:N)**
- Team → Driver
- Team → RaceResult
- Team → RaceParticipation
- Team → RaceLog (optional)
- Driver → RaceResult
- Driver → RaceIncident
- Driver → RaceLog (optional)
- Season → Race
- Circuit → Race
- Race → RaceResult
- Race → RaceIncident
- Race → RaceParticipation
- Race → RaceLog
- User → Race (as reviewer, optional)

### **Many-to-Many (M:N)**
- Team ↔ Sponsor (via _TeamSponsors)
- Team ↔ Race (via RaceParticipation)

---

## 🔑 Key Constraints

### **Primary Keys (PK)**
Every table has an auto-incrementing `id` as primary key.

### **Foreign Keys (FK)**
All foreign keys enforce referential integrity with CASCADE delete where appropriate.

### **Unique Constraints**
- `Team.name`
- `Driver(teamId, number)` - Driver number unique per team
- `Season.year`
- `Circuit.name`
- `User.username`
- `Sponsor.name`
- `Car.teamId` - One car per team
- `RaceResult(raceId, driverId)` - One result per driver per race
- `RaceParticipation(raceId, teamId)` - One participation per team per race
- `RaceIncident.penaltyId` - One penalty per incident

---

## 📊 Enums

### **UserRole**
- ADMIN
- STEWARD

### **PenaltyType**
- TimePenalty
- GridPenalty
- Warning
- NoFurtherAction

### **RaceStatus**
- SCHEDULED
- IN_PROGRESS
- COMPLETED
- CANCELLED

### **LogSeverity**
- INFO
- WARNING
- CRITICAL

---

## 🎯 Functional Dependencies

### **Team**
```
id → {name, fullName, description, base, teamChief, color}
name → {id, fullName, description, base, teamChief, color}
```

### **Driver**
```
id → {teamId, name, number, nationality, points, podiums}
{teamId, number} → {id, name, nationality, points, podiums}
```

### **Race**
```
id → {circuitId, seasonId, reviewedById, name, date, status, isReviewed}
```

### **RaceResult**
```
id → {raceId, driverId, teamId, position, time, points, penalty, fastestLap}
{raceId, driverId} → {id, teamId, position, time, points, penalty, fastestLap}
```

---

## 🔄 Cascade Delete Rules

### **ON DELETE CASCADE**
- Driver: When Team deleted → All Drivers deleted
- Driver: When Driver deleted → RaceResults, RaceIncidents, RaceLogs deleted
- RaceParticipation: When Race deleted → Participation deleted
- RaceParticipation: When Team deleted → Participation deleted
- RaceLog: When Race deleted → Logs deleted
- RaceLog: When Driver deleted → Driver reference nullified
- RaceLog: When Team deleted → Team reference nullified

### **ON DELETE SET NULL**
- Race.reviewedById: When User deleted → reviewedById set to NULL
- RaceIncident.penaltyId: When Penalty deleted → penaltyId set to NULL

---

## 📈 Normalization Level

**3NF (Third Normal Form)**

All tables are in 3NF because:
1. ✅ **1NF**: All attributes are atomic (no multi-valued attributes)
2. ✅ **2NF**: No partial dependencies (all non-key attributes depend on entire primary key)
3. ✅ **3NF**: No transitive dependencies (non-key attributes don't depend on other non-key attributes)

---

## 🎨 Color Coding (for ER Diagram)

- 🔵 **Blue**: Team & Driver entities
- 🟡 **Yellow**: Season & Circuit entities
- 🟣 **Purple**: Race & Log entities
- 🔴 **Red**: Results & Incidents entities
- 🟢 **Green**: User entity

---

## 📝 Notes

1. **Timestamps**: All tables have `createdAt` and `updatedAt` timestamps (not shown in simplified schema)
2. **Optional FKs**: Marked as OPTIONAL where NULL is allowed
3. **Composite Keys**: Used for junction tables and unique constraints
4. **Indexes**: Automatically created on all foreign keys and unique constraints

---

**This schema supports all F1 Race Control application features including:**
- ✅ Team & Driver Management
- ✅ Race Scheduling & Monitoring
- ✅ Results Recording
- ✅ Incident Tracking & Penalties
- ✅ Championship Standings
- ✅ Steward Review System
- ✅ Real-time Race Logging
