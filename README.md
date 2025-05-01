# Full Stack Application

A full-stack application with user authentication, dashboard, and multi-language support.

## Project Structure

The project is divided into two main parts:

### Backend

- Built with Node.js and TypeScript
- Uses Prisma ORM for database operations
- JWT authentication with refresh tokens
- RESTful API architecture

### Frontend

- React application built with Vite
- TypeScript for type safety
- Tailwind CSS for styling
- i18n internationalization support (English and Spanish)
- State management with custom stores

## Prerequisites

- Node.js (v22 or higher)
- Docker and Docker Compose
- npm or yarn

## Getting Started

### Installation

1. Clone the repository:

```bash
git clone https://github.com/gregoryduckworth/node-frontend-backend-db.git
cd node-frontend-backend-db
```

2. Install dependencies:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application with Docker

```bash
# Start all services
docker-compose up

# Run in background
docker-compose up -d
```

### Running the Application Locally

1. Start the backend:

```bash
cd backend
npm run dev
```

2. Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

## Features

- User authentication (Login, Register, Forgot Password)
- Dashboard
- Responsive design with mobile support
- Multi-language support (English, Spanish)
- Real-time notifications

## Technology Stack

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- JWT Authentication

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- i18n for internationalization

## Database

The application uses a relational database managed through Prisma ORM. The database schema can be found in `backend/prisma/schema.prisma`.

## API Endpoints

- Authentication routes (login, register, forgot password)
- User management routes
- (Other endpoints would be documented here)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

[MIT](LICENSE)
