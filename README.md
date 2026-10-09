# ResQNet: Smart Animal Rescue & Welfare Platform

> **Final Year MCA Project**  
> *A comprehensive, multi-role digital ecosystem connecting the public, rescue squads, animal shelters, veterinary clinics, and platform administrators powered by real-time GPS tracking, IoT telemetry, and AI vision triage.*

---

## 📋 Table of Contents
1. [Executive Summary](#-executive-summary)
2. [Key Features & Role-Based Workflows](#-key-features--role-based-workflows)
3. [Architecture & Technology Stack](#-architecture--technology-stack)
4. [Domain Modules & Data Models](#-domain-modules--data-models)
5. [IoT & AI Capabilities](#-iot--ai-capabilities)
6. [API Endpoints Reference](#-api-endpoints-reference)
7. [Installation & Setup Guide](#-installation--setup-guide)
8. [Database Seeding & Test Execution](#-database-seeding--test-execution)
9. [Project Directory Structure](#-project-directory-structure)

---

## 🚀 Executive Summary

**ResQNet** addresses critical delays and fragmented workflows in urban animal welfare and emergency response. In traditional environments, stray or injured animal reporting relies on uncoordinated hotlines and informal social media posts, leading to delayed medical attention, lost rescue tracking, and inefficient shelter management.

ResQNet unifies the complete life-cycle of animal welfare into a single cloud-native application:
$$\text{Public Incident Report} \longrightarrow \text{GPS Emergency Dispatch} \longrightarrow \text{Shelter Intake \& Cage Allocation} \longrightarrow \text{Veterinary Care} \longrightarrow \text{Public Adoption}$$

---

## 👥 Key Features & Role-Based Workflows

ResQNet implements fine-grained role-based access control (RBAC) supporting 5 primary stakeholders:

### 1. 🌐 Public Users & Adopters
* **Emergency Rescue Reporting**: Submit injured/stray animal location coordinates, upload photos, and track live rescue dispatch status.
* **Pet Adoption Portal**: Filter adoptable animals by species, breed, age, and location. Submit adoption applications with pre-filled user profiles.
* **Incident History**: Monitor previously reported cases and receive notification updates.

### 2. 🚑 Rescue Squads & Teams
* **Incident Dispatch Dashboard**: View live emergency rescue calls mapped by distance and urgency.
* **Status Tracking**: Update incident status (`Pending` $\rightarrow$ `Assigned` $\rightarrow$ `In Transit` $\rightarrow$ `Rescued` $\rightarrow$ `Delivered to Shelter`).
* **Team & Site Visit Reports**: Log field inspection reports and apply for official rescue squad verification.

### 3. 🏡 Animal Shelter Managers
* **Capacity & Cage Allocation**: Manage total shelter capacity, assign animals to specific cages/kennels, and track room availability.
* **Intake & Adoption Workflow**: Review incoming public adoption applications, conduct home verification checks, and approve/reject requests.
* **Shelter Applications**: Apply for verified shelter registration on the ResQNet platform.

### 4. 🩺 Veterinary Staff & Clinics
* **Clinical Health Records**: Maintain medical histories, treatments, surgeries, post-operative care, and prescriptions.
* **Vaccination Schedules**: Track rabies, DHPP, and core vaccinations with automated reminder triggers.
* **Medicine Inventory**: Record medication dosage and treatment logs.

### 5. 👑 Platform Administrators
* **Global Ecosystem Oversight**: Manage platform users, approve/reject shelter and rescue team applications.
* **IoT Smart Collar Telemetry**: Monitor satellite GPS coordinates, vital sign streams (BPM, body temp), solar battery levels, and geofence safe zones.
* **AI Vision Triage Suite**: Process distress images through an AI neural vision classifier for severity grading, lesion detection, and hotspot forecasting.

---

## 🛠️ Architecture & Technology Stack

```
                                  ┌────────────────────────┐
                                  │   React 19 + Vite UI   │
                                  │ (Tailwind CSS v4 / MAP)│
                                  └───────────┬────────────┘
                                              │
                                              ▼ REST / WebSockets
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                  Node.js / Express API                                  │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────┐ │
│ │ Auth & OTP   │ Animals      │ Rescues      │ Shelters     │ Medicals     │ AI / IoT │ │
│ └──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────┘ │
└─────────────┬───────────────────────────────┬──────────────────────────────┬────────────┘
              │                               │                              │
              ▼                               ▼                              ▼
    ┌──────────────────┐            ┌──────────────────┐           ┌──────────────────┐
    │  MongoDB Database│            │ Cloudinary Media │           │  Nodemailer OTP  │
    │   (Mongoose ODM) │            │   Image Storage  │           │   Email Engine   │
    └──────────────────┘            └──────────────────┘           └──────────────────┘
```

### Stack Details
* **Frontend Client**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Leaflet / Google Maps API, Socket.IO Client, Zod validation.
* **Backend Server**: Node.js, Express (Domain-Driven Modular Architecture in `server/modules/`), Mongoose ODM, JWT authentication, bcryptjs, Winston logging.
* **External Services**: Cloudinary (profile/animal photos), Nodemailer (email verification/OTP), Firebase Admin.
* **Quality Assurance**: Playwright End-to-End browser testing suite (`playwright.config.js`).

---

## 🧬 Domain Modules & Data Models

The backend is structured into domain-specific modules inside `server/modules/`:

| Module | Key Models | Core Functionality |
| :--- | :--- | :--- |
| `auth` | `otpModel.js` | JWT Authentication, dual email/phone OTP validation, password resets. |
| `users` | `userModel.js` | User profiles, role permissions, application statuses. |
| `animals` | `animalModel.js`, `categoryModel.js` | Animal registry, health status, category classification (Dog, Cat, etc.). |
| `rescues` | `rescueRequestModel.js`, `rescueAssignmentModel.js` | Incident location reports, team dispatching, status milestones. |
| `shelters` | `shelterModel.js`, `cageModel.js`, `capacityModel.js` | Shelter registration, cage management, capacity utilization. |
| `medicals` | `medicalRecordModel.js`, `vaccinationModel.js` | Clinical notes, surgery logs, vaccination tracking. |
| `adoption` | `adoptionApplicationModel.js` | Public adoption requests, screening evaluation, approval workflow. |
| `notifications` | `notificationModel.js` | In-app notification dispatcher for emergency updates. |

---

## 📡 IoT & AI Capabilities

### 🛰️ IoT Smart Collar Telemetry Suite ([SmartCollar.jsx](file:///d:/INT%20MCA/S09/Final%20Year%20Project/resqnet/client/src/features/admin/SmartCollar.jsx))
* **Live Vital Stream**: Real-time heart rate (BPM) with cardiac waveform SVG pulse, body temperature (°C), and respiration rate.
* **Geofence Safe Zone Monitor**: Satellite GPS coordinate tracking (14 GPS fix lock) with 500m safe radius perimeter breach alerts.
* **Solar Auxiliary Charging**: Battery level monitoring with solar charge indicators (+12mA).

### 🤖 AI Vision & Diagnostics Suite ([AIModule.jsx](file:///d:/INT%20MCA/S09/Final%20Year%20Project/resqnet/client/src/features/admin/AIModule.jsx))
* **Distress Image Triage**: Multi-layer neural vision classifier scoring distress severity (0-10) and urgency level (`CRITICAL`, `URGENT`, `MODERATE`, `NORMAL`).
* **Lesion & Anomaly Segmentation**: Automated detection of limb fractures, cutaneous lacerations, and dermatitis infections.
* **Hotspot Prediction Heatmap**: Regional rescue risk forecasting based on historical density.

---

## 🔌 API Endpoints Reference

### Authentication (`/api/auth`)
* `POST /api/auth/register` - Register a new user account.
* `POST /api/auth/login` - Authenticate user & issue JWT token.
* `POST /api/auth/send-otp` - Dispatch OTP verification email.
* `POST /api/auth/verify-otp` - Validate email/phone OTP code.

### Animals & Adoption (`/api/animals`, `/api/adoptions`)
* `GET /api/animals` - List all registered animals with status filters.
* `POST /api/animals` - Register new animal profile (Shelter/Admin).
* `GET /api/adoptions/applications` - Fetch adoption applications.
* `POST /api/adoptions/apply` - Submit pet adoption application.

### Rescues & Emergency (`/api/rescues`, `/api/rescue-requests`)
* `GET /api/rescue-requests` - Fetch active rescue incident reports.
* `POST /api/rescue-requests` - Submit new emergency rescue request with GPS coordinates.
* `PATCH /api/rescue-requests/:id/status` - Update rescue dispatch milestone.

### Veterinary & Medical (`/api/veterinary`)
* `GET /api/veterinary/records/:animalId` - Retrieve clinical history for an animal.
* `POST /api/veterinary/records` - Log new medical treatment or surgical record.
* `POST /api/veterinary/vaccinations` - Record vaccination entry.

---

## 💻 Installation & Setup Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **MongoDB**: Local MongoDB instance or MongoDB Atlas URI

### 1. Clone the Repository
```bash
git clone https://github.com/dennisjacob03/ResQNet.git
cd resqnet
```

### 2. Environment Configuration

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/resqnet
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

Create a `.env` file in the `client` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Install Dependencies
Install dependencies across workspace root, client, and server packages:
```bash
npm run install-all
```

### 4. Run Development Servers
Start both the React client and Express backend concurrently:
```bash
npm run dev
```
* **Frontend UI**: `http://localhost:5173`
* **Backend API**: `http://localhost:5000`

---

## 🧪 Database Seeding & Test Execution

### Database Seed Scripts
Run pre-configured database enrichment scripts located in `server/scripts/`:
```bash
# Seed sample animals and rich categories
node server/scripts/enrichAnimals.js

# Test end-to-end veterinary clinical workflow
node server/scripts/testVeterinaryFlow.js
```

### End-to-End Testing (Playwright)
Run the automated Playwright browser test suite:
```bash
# Run all end-to-end tests
npx playwright test

# Run tests in UI interactive mode
npx playwright test --ui
```

---

## 📁 Project Directory Structure

```
resqnet/
├── client/                     # React 19 Frontend Application
│   ├── src/
│   │   ├── components/         # Shared UI Components (Navbar, Footer, Maps)
│   │   ├── context/            # AuthContext & SocketContext
│   │   ├── features/           # Feature Modules by Role
│   │   │   ├── admin/          # Admin Dashboard, Smart Collar, AI Module
│   │   │   ├── adoption/       # Pet Details & Adoption Flow
│   │   │   ├── auth/           # Login, Register, Forgot Password
│   │   │   ├── landing/        # ResQNet Landing Page
│   │   │   ├── rescue-team/    # Rescue Squad Operations
│   │   │   ├── shelter/        # Shelter Manager Dashboard & Cages
│   │   │   ├── user-dashboard/ # Public User Incident Tracking
│   │   │   └── veterinary/     # Vet Medical Records & Vaccinations
│   │   └── App.jsx             # React Router Gateway & Role Routing
│   └── package.json
├── server/                     # Node.js / Express Backend API
│   ├── config/                 # DB & Firebase Connections
│   ├── modules/                # Modular Domain Architecture
│   │   ├── adoption/
│   │   ├── animals/
│   │   ├── auth/
│   │   ├── medicals/
│   │   ├── notifications/
│   │   ├── rescues/
│   │   ├── shelters/
│   │   └── users/
│   ├── scripts/                # Data Seeding & Flow Testers
│   ├── server.js               # Express Server Entry Point
│   └── package.json
├── tests/                      # Playwright E2E Specification Suites
├── playwright.config.js        # Playwright Configuration
└── README.md                   # Project Documentation
```

---

## 📜 License
This project is developed as part of the Final Year MCA Curriculum. Licensed under the [ISC License](LICENSE).
