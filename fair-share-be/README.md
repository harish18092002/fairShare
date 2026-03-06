# FairShare Backend - Microservices

This is an Nx monorepo containing three NestJS microservices for the FairShare application.

## Microservices

### 1. Authentication Service
- **Port**: 3001
- **Purpose**: Handles user authentication, login, and signup

### 2. Bill Management Service
- **Port**: 3002
- **Purpose**: Manages bills and related operations

### 3. Analytics Service
- **Port**: 3003
- **Purpose**: Provides analytics and reporting functionality

## Running the Services

### Run Individual Services

```bash
# Run Authentication Service
nx serve authentication

# Run Bill Management Service
nx serve bill-management

# Run Analytics Service
nx serve analytics
```

### Build Services

```bash
# Build Authentication Service
nx build authentication

# Build Bill Management Service
nx build bill-management

# Build Analytics Service
nx build analytics
```

### Build All Services

```bash
nx run-many --target=build --all
```

## Project Structure

```
fair-share-be/
├── apps/
│   ├── authentication/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── app.controller.ts
│   │   │   └── app.service.ts
│   │   ├── project.json
│   │   ├── tsconfig.json
│   │   └── tsconfig.build.json
│   ├── bill-management/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── app.controller.ts
│   │   │   └── app.service.ts
│   │   ├── project.json
│   │   ├── tsconfig.json
│   │   └── tsconfig.build.json
│   └── analytics/
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── app.controller.ts
│       │   └── app.service.ts
│       ├── project.json
│       ├── tsconfig.json
│       └── tsconfig.build.json
├── nx.json
├── tsconfig.base.json
└── package.json
```

## Installation

```bash
npm install
```

## Technologies

- **NestJS**: Progressive Node.js framework
- **Nx**: Smart monorepo build system
- **TypeScript**: Typed JavaScript
