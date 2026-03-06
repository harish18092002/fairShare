# FairShare

A comprehensive bill-splitting and expense management application built with a microservices architecture.

## 📋 Project Overview

FairShare helps users manage shared expenses, split bills fairly, and track group payments with ease. The application is built using a modern microservices architecture with separate services for authentication, bill management, and analytics.

## 🏗️ Architecture

This repository contains:

- **Backend**: NestJS microservices (Nx monorepo)
- **Frontend**: *(To be added)*

### Microservices

The backend consists of three independent microservices:

| Service | Port | Purpose |
|---------|------|---------|
| **Authentication** | 3001 | User authentication, login, and signup |
| **Bill Management** | 3002 | Bill creation, splitting, and management |
| **Analytics** | 3003 | Reporting and analytics functionality |

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
# Authentication Service (Port 3001)
nx serve authentication

# Bill Management Service (Port 3002)
nx serve bill-management

# Analytics Service (Port 3003)
nx serve analytics
```

Build services:
```bash
# Build specific service
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
│   │   ├── authentication/     # Authentication service
│   │   ├── bill-management/    # Bill management service
│   │   └── analytics/          # Analytics service
│   ├── nx.json                 # Nx workspace configuration
│   ├── tsconfig.base.json      # Base TypeScript configuration
│   └── package.json            # Dependencies
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## 🛠️ Technology Stack

### Backend
- **Framework**: NestJS
- **Build System**: Nx
- **Language**: TypeScript
- **Runtime**: Node.js

### Frontend
- *(To be added)*

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
nx test authentication
nx test bill-management
nx test analytics

# Run all tests
nx run-many --target=test --all
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

*(Add team members here)*

## 📞 Support

For support, please open an issue in the repository.

---

**Note**: This project is under active development. Features and documentation will be updated regularly.
