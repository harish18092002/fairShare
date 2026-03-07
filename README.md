# FairShare

A comprehensive bill-splitting and expense management application built with a microservices architecture.

## 📋 Project Overview

FairShare helps users manage shared expenses, split bills fairly, and track group payments with ease. The application is built using a modern microservices architecture with separate services for authentication, bill management, and analytics.

## 🏗️ Architecture

This repository contains:

- **Backend**: NestJS microservices (Nx monorepo)
- **Frontend**: _(To be added)_

### Microservices Architecture

The backend uses an **API Gateway pattern** with four independent microservices:

| Service             | Port | Purpose                                     | Tech Stack                                    |
| ------------------- | ---- | ------------------------------------------- | --------------------------------------------- |
| **Gateway**         | 3000 | API Gateway, rate limiting, request routing | NestJS, @nestjs/throttler                     |
| **Authentication**  | 3001 | User authentication, login, and signup      | NestJS, Drizzle ORM, PostgreSQL, JWT          |
| **Bill Management** | 3002 | Bill upload, OCR, splitting, contributions  | NestJS, Drizzle ORM, PostgreSQL, Tesseract.js |
| **Analytics**       | 3003 | Reporting, insights, spending analytics     | NestJS, Drizzle ORM, PostgreSQL, Redis        |

### Architecture Flow

```
Client Applications
        ↓
API Gateway (Port 3000) - Rate Limiting & Routing
        ↓
    ┌───┴────┬──────────────┬──────────────┐
    ↓        ↓              ↓              ↓
Auth      Bill Mgmt    Analytics      (Future)
(3001)     (3002)        (3003)
    ↓        ↓              ↓
PostgreSQL  PostgreSQL  PostgreSQL + Redis
```

### Communication Pattern

- **Client → Gateway**: REST API (HTTP/HTTPS)
- **Gateway → Services**: RPC (TCP/gRPC) - _To be implemented_
- **Services → Database**: Drizzle ORM queries
- **Services → Cache**: Redis (Analytics service)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd fairShare
   ```

2. **Install backend dependencies**
   ```bash
   cd fair-share-be
   npm install
   ```

### Running the Application

#### Backend Services

Navigate to the backend directory:

```bash
cd fair-share-be
```

Run individual services:

```bash
# API Gateway (Port 3000) - Start this first
nx serve gateway

# Authentication Service (Port 3001)
nx serve authentication

# Bill Management Service (Port 3002)
nx serve bill-management

# Analytics Service (Port 3003)
nx serve analytics
```

Run all services concurrently:

```bash
# Using npm-run-all (install first: npm i -D npm-run-all)
npm run start:all

# Or manually in separate terminals
nx serve gateway & nx serve authentication & nx serve bill-management & nx serve analytics
```

Build services:

```bash
# Build specific service
nx build gateway
nx build authentication
nx build bill-management
nx build analytics

# Build all services
nx run-many --target=build --all
```

## 📁 Project Structure

```
fairShare/
├── fair-share-be/              # Backend microservices
│   ├── apps/
│   │   ├── gateway/            # API Gateway (Port 3000)
│   │   │   ├── src/
│   │   │   ├── project.json
│   │   │   └── README.md
│   │   ├── authentication/     # Auth service (Port 3001)
│   │   │   ├── src/
│   │   │   ├── project.json
│   │   │   └── README.md
│   │   ├── bill-management/    # Bill service (Port 3002)
│   │   │   ├── src/
│   │   │   ├── project.json
│   │   │   └── README.md
│   │   └── analytics/          # Analytics service (Port 3003)
│   │       ├── src/
│   │       ├── project.json
│   │       └── README.md
│   ├── nx.json                 # Nx workspace configuration
│   ├── tsconfig.base.json      # Base TypeScript configuration
│   ├── package.json            # Dependencies
│   └── README.md               # Backend overview
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
└── IMPLEMENTATION_GUIDE.md     # Detailed implementation guide
```

## 🛠️ Technology Stack

### Backend

- **Framework**: NestJS
- **Build System**: Nx Monorepo
- **Language**: TypeScript
- **Runtime**: Node.js
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Caching**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **Rate Limiting**: @nestjs/throttler
- **OCR**: Tesseract.js / Google Vision API
- **File Upload**: Multer
- **Image Processing**: Sharp

### Frontend

- _(To be added)_

### DevOps

- **Containerization**: Docker
- **Orchestration**: Kubernetes (planned)
- **CI/CD**: GitHub Actions (planned)

## 📝 Development Guidelines

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages

### Git Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Commit with descriptive messages
4. Push and create a pull request

## 🧪 Testing

```bash
# Run tests for specific service
nx test gateway
nx test authentication
nx test bill-management
nx test analytics

# Run all tests
nx run-many --target=test --all

# Run tests with coverage
nx test authentication --coverage

# E2E tests
nx e2e gateway-e2e
```

## 📦 Building for Production

```bash
cd fair-share-be

# Build all services
nx run-many --target=build --all --configuration=production
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED License.

## 👥 Team

_(Add team members here)_

## 📞 Support

For support, please open an issue in the repository.

---

**Note**: This project is under active development. Features and documentation will be updated regularly.
