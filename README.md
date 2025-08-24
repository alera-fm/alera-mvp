# ALERA Artist Cockpit

A comprehensive dashboard for artists to manage their music career, including analytics, wallet management, fan engagement, and AI-powered assistance.

## Features

- **Analytics Dashboard**: Track streaming performance across platforms
- **Wallet Management**: Monitor earnings and request payouts
- **Fan Zone**: Manage fan campaigns and engagement
- **Release Management**: Upload and track music releases
- **AI Agent**: Get intelligent insights about your music career

## AI Agent Setup

The AI Agent uses OpenAI's GPT-4 to provide intelligent, contextual responses about your music career. To enable full AI capabilities:

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add your API key to the `.env` file:
   ```
   OPENAI_API_KEY=your-actual-openai-api-key-here
   ```
3. Restart your development server

Without an OpenAI API key, the AI Agent will run in demo mode with basic template responses.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   ```
   DATABASE_URL=your-database-url
   JWT_SECRET=your-jwt-secret
   NEXT_PUBLIC_APP_URL=your-app-url
   OPENAI_API_KEY=your-openai-api-key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, PostgreSQL
- **AI**: OpenAI GPT-4
- **Authentication**: JWT
- **UI Components**: Radix UI, Framer Motion
