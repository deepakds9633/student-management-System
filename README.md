# Student Management System

The entire Student Management System is redesigned with a global, enterprise-grade user interface inspired by modern SaaS platforms such as cloud dashboards and international EdTech products. The UI focuses on elegance, clarity, responsiveness, and immersive user experience. It integrates advanced design principles including glassmorphism, gradient themes, dynamic animations, and intelligent layouts to deliver a visually stunning and highly professional platform suitable for global standards.
## Features

- **Modern & Responsive UI:** A full-width, mobile-responsive layout utilizing glassmorphism, gradient accents, soft shadows, and smooth micro-animations.
- **Dynamic Theme Switching:** Integrated dark and light modes for enhanced accessibility and optimal viewing in any environment.
- **Advanced Data Visualization:** Real-time analytics, charts, and intelligent monitoring components embedded directly into role-specific dashboards.
- **Role-Based Access Control:** Customized dashboards and efficient workflows tailored for Students, Faculty, and Administrators.
- **Enterprise-ready:** Built to scale for global deployment, fully integrating operational data without wasted space.

## Technology Stack

### Frontend (User Interface)
- React 18+
- Vite (Build Tool & Dev Server)
- Tailwind CSS (Utility-first styling framework)
- Material UI (MUI) (for advanced component structures)
- Recharts (for Data Visualization and Analytics)
- React Router (for SPA Navigation)

### Backend (API & Core Logic)
- Spring Boot (Java 17+)
- Spring Data JPA (Hibernate)
- Spring Security (for Authentication & Role-based Access)
- MySQL / PostgreSQL Database

## Getting Started

### Prerequisites
- Node.js (v18+)
- Java Runtime Environment (JRE 17+)
- Maven
- MySQL Database

### Running the System Locally

1. **Clone the repository**
   ```bash
   git clone <repository_url>
   cd student-management-main
   ```

2. **Start the Backend**
   Navigate to the `backend/` directory, configure your `application.properties` with the correct database credentials, and start the application:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   The backend API will run on `http://localhost:8080`.

3. **Start the Frontend**
   Navigate to the `frontend/` directory, install dependencies, and start the Vite development server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend application will be accessible at `http://localhost:5173`.

## Documentation
For a complete overview of the recent UI transformation, see the internal project Walkthroughs.
