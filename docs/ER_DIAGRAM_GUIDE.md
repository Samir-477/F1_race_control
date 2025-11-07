# 📐 ER Diagram Guide

## 🎨 How to Use the ER Diagram

### **Method 1: Open in draw.io (Online)**

1. Go to https://app.diagrams.net/
2. Click **"Open Existing Diagram"**
3. Select **"Open from Device"**
4. Choose the file: `ER_DIAGRAM.drawio`
5. The diagram will open automatically! ✅

### **Method 2: Open in draw.io Desktop**

1. Download draw.io desktop from: https://www.drawio.com/
2. Install and open the application
3. File → Open → Select `ER_DIAGRAM.drawio`
4. Done! ✅

---

## 📊 Diagram Overview

### **Entities (Tables)**

The diagram shows **13 main entities** organized by color:

#### 🔵 **Blue - Team & Driver Management**
- **Team**: Core team information
- **Driver**: Driver details linked to teams
- **Car**: Team car specifications

#### 🟡 **Yellow - Season & Circuit**
- **Season**: F1 seasons (e.g., 2024)
- **Circuit**: Race tracks (e.g., Monaco, Silverstone)

#### 🟣 **Purple - Race Management**
- **Race**: Individual race events
- **RaceLog**: Real-time race event logs

#### 🔴 **Red - Results & Incidents**
- **RaceResult**: Final race standings
- **RaceIncident**: On-track incidents
- **Penalty**: Penalty details

#### 🟢 **Green - User Management**
- **User**: Admin and Steward users

---

## 🔗 Relationship Types

### **Solid Lines**: Direct relationships
- One-to-One (1:1): Single line on both ends
- One-to-Many (1:N): Single line → Crow's foot
- Many-to-Many (M:N): Crow's foot ↔ Crow's foot

### **Dashed Lines**: Optional relationships
- Example: User → Race (reviews) - Optional because not all races are reviewed yet

---

## 📋 Reading the Diagram

### **Each Entity Box Shows:**
```
┌─────────────────┐
│ Entity Name     │ ← Table name
├─────────────────┤
│ PK: id          │ ← Primary Key
│ FK: teamId      │ ← Foreign Key
│ name            │ ← Regular attributes
│ number          │
└─────────────────┘
```

### **Key Abbreviations:**
- **PK**: Primary Key (unique identifier)
- **FK**: Foreign Key (reference to another table)
- **UNIQUE**: Attribute must be unique across all rows

---

## 🎯 Main Relationships

### **Team Relationships**
```
Team (1) ─── has ───> (N) Driver
Team (1) ─── has ───> (1) Car
Team (N) ←── sponsors ──→ (N) Sponsor
Team (N) ←── participates ──→ (N) Race
```

### **Race Relationships**
```
Season (1) ─── contains ───> (N) Race
Circuit (1) ─── hosts ───> (N) Race
Race (1) ─── has ───> (N) RaceResult
Race (1) ─── has ───> (N) RaceIncident
Race (1) ─── logs ───> (N) RaceLog
User (1) ─── reviews ───> (N) Race (optional)
```

### **Driver Relationships**
```
Driver (1) ─── achieves ───> (N) RaceResult
Driver (1) ─── involved in ───> (N) RaceIncident
```

### **Incident & Penalty**
```
RaceIncident (1) ─── may have ───> (1) Penalty
```

---

## 🛠️ Editing the Diagram

### **To Add a New Entity:**
1. Click on an existing entity
2. Ctrl+C (copy), Ctrl+V (paste)
3. Double-click to edit text
4. Change colors via Format → Fill Color

### **To Add a Relationship:**
1. Click the arrow tool in the toolbar
2. Drag from one entity to another
3. Right-click the line → Edit Style → Choose arrow type
4. Add label by double-clicking the line

### **To Change Colors:**
- Select entity → Format panel (right side) → Fill Color
- Use the color scheme:
  - Blue (#dae8fc): Team/Driver
  - Yellow (#fff2cc): Season/Circuit
  - Purple (#e1d5e7): Race/Log
  - Red (#f8cecc): Results/Incidents
  - Green (#d5e8d4): User

---

## 📤 Exporting the Diagram

### **Export as Image:**
1. File → Export as → PNG/JPEG/SVG
2. Choose resolution (300 DPI for print)
3. Save

### **Export as PDF:**
1. File → Export as → PDF
2. Choose page size
3. Save

### **Share Online:**
1. File → Publish → Link
2. Copy the shareable link
3. Anyone with link can view (read-only)

---

## 🎨 Diagram Features

### **Current Layout:**
- **Clean & Simple**: Easy to understand
- **Color-Coded**: Entities grouped by function
- **Legend Included**: Explains colors and abbreviations
- **Proper Spacing**: Not cluttered
- **Clear Labels**: All relationships labeled

### **What's Shown:**
- ✅ All 13 tables
- ✅ Primary keys (PK)
- ✅ Foreign keys (FK)
- ✅ Key attributes
- ✅ All relationships
- ✅ Cardinality (1:1, 1:N, M:N)
- ✅ Optional relationships (dashed lines)

### **What's Not Shown (for simplicity):**
- ❌ All attributes (only key ones shown)
- ❌ Data types
- ❌ Timestamps (createdAt, updatedAt)
- ❌ Indexes
- ❌ Constraints details

---

## 💡 Tips

1. **Zoom**: Use Ctrl+Mouse Wheel to zoom in/out
2. **Pan**: Hold Space+Drag to move around
3. **Select Multiple**: Ctrl+Click to select multiple entities
4. **Align**: Use Arrange → Align to align entities
5. **Auto-Layout**: Arrange → Layout → Choose layout type

---

## 📚 Related Files

- **`RELATIONAL_SCHEMA.md`**: Detailed text-based schema
- **`DATABASE_SETUP_GUIDE.md`**: Database setup instructions
- **`server/prisma/schema.prisma`**: Actual database schema code

---

## 🎯 Use Cases

### **For Documentation:**
- Include in project reports
- Add to README
- Share with team members

### **For Presentations:**
- Export as high-res image
- Use in slides
- Print for posters

### **For Development:**
- Reference during coding
- Plan new features
- Understand relationships

---

**Your ER diagram is ready to use!** 🎉

Open it in draw.io and explore the F1 Race Control database structure visually!
