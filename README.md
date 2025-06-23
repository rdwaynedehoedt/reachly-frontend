# Reachly - Email Outreach Automation Platform

Reachly is a smart email outreach automation platform designed to help businesses and professionals streamline their communication efforts. The platform enables users to securely sign in using enterprise-grade authentication (Asgardeo), connect multiple email accounts via IMAP/SMTP, and manage personalized email campaigns efficiently.

## Project Structure

This project consists of two main parts:

1. **Backend (Node.js/Express)**: Authentication and API services
2. **Frontend (Next.js)**: User interface and client-side application

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Asgardeo account with a configured application

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd reachly-Backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   # Asgardeo Configuration
   ASGARDEO_ORGANISATION=your-organization-name
   ASGARDEO_CLIENT_ID=your-client-id
   ASGARDEO_CLIENT_SECRET=your-client-secret

   # Server Configuration
   PORT=3001
   CORS_ORIGIN=http://localhost:3000
   SESSION_SECRET=your-session-secret
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd reachly-frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the frontend directory with the following content:
   ```
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret
   ```

4. Start the frontend development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Asgardeo Configuration

To configure Asgardeo for this application:

1. Sign up for an Asgardeo account at https://wso2.com/asgardeo/
2. Create a new application
3. Configure the following redirect URLs:
   - `http://localhost:3001/auth/callback` (Backend callback)
   - `http://localhost:3000` (Frontend redirect after login)
4. Obtain the Client ID and Client Secret
5. Update your `.env` files with these credentials

## Features

- Secure user authentication with Asgardeo
- Email account integration (Gmail, Outlook, any IMAP/SMTP)
- Campaign creation and management
- Contact management
- Email tracking and analytics
- User dashboard

## Development

This project uses:

- Express.js for the backend API
- Next.js for the frontend
- NextAuth.js for authentication flow
- Tailwind CSS for styling 