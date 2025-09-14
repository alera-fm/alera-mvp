# ALERA Application Architecture

## Overview
ALERA is a comprehensive music artist management platform built with Next.js 15, TypeScript, and PostgreSQL. It provides artists with tools for music distribution, analytics, fan management, earnings tracking, and AI-powered assistance.

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom ALERA branding
- **UI Components**: Radix UI for accessibility
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context (AuthContext, ChatContext)
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT with bcrypt password hashing
- **AI Integration**: OpenAI GPT-4 API
- **File Processing**: Built-in file upload handling
- **Email**: Nodemailer for verification and notifications

### Database
- **Primary**: PostgreSQL
- **Connection**: pg with connection pooling
- **Migrations**: 24 migration files for schema evolution
- **Indexing**: Comprehensive indexes for performance

## Project Structure

```
/Users/muhammadawais/Documents/Alera/Alera-mvp/
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API routes
│   │   ├── admin/                # Admin-only endpoints
│   │   ├── ai-agent/             # AI chat and context
│   │   ├── analytics/            # Analytics data
│   │   ├── auth/                 # Authentication
│   │   ├── dashboard/            # Dashboard data
│   │   ├── distribution/         # Music distribution
│   │   ├── fanzone/              # Fan management
│   │   ├── files/                # File serving
│   │   ├── landing-page/         # Public pages
│   │   ├── profile/              # User profiles
│   │   ├── public/               # Public endpoints
│   │   ├── upload/               # File uploads
│   │   ├── upload-revenue-report/ # Revenue processing
│   │   └── wallet/               # Financial management
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Main application pages
│   ├── p/                        # Public artist pages
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── admin/                    # Admin-specific components
│   ├── analytics/                # Analytics components
│   ├── auth/                     # Authentication components
│   ├── blocks/                   # Landing page blocks
│   ├── distribution/             # Distribution components
│   ├── fanzone/                  # Fan management components
│   ├── my-music/                 # Music catalog components
│   ├── ui/                       # Reusable UI components
│   ├── wallet/                   # Wallet components
│   └── [various].tsx             # Feature components
├── context/                      # React Context providers
│   ├── AuthContext.tsx           # Authentication state
│   └── ChatContext.tsx           # AI chat state
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries
│   ├── migrations/               # Database migrations
│   ├── auth.ts                   # Authentication utilities
│   ├── db.ts                     # Database connection
│   ├── email.ts                  # Email utilities
│   └── [various].ts              # Other utilities
├── public/                       # Static assets
└── styles/                       # Additional styles
```

## Database Schema

### Core Tables

#### Users
```sql
users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  artist_name VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### Streaming Earnings
```sql
streaming_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL,
  reporting_month DATE,
  sale_month DATE NOT NULL,
  platform VARCHAR(100) NOT NULL,
  artist VARCHAR(255),
  title VARCHAR(255),
  isrc VARCHAR(50),
  upc VARCHAR(50),
  quantity INTEGER,
  team_percentage DECIMAL(5,2),
  song_album VARCHAR(255),
  country_of_sale VARCHAR(100),
  songwriter_royalties_withheld DECIMAL(10,2),
  amount_usd DECIMAL(10,2) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### Releases & Tracks
```sql
releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  distribution_type VARCHAR(20) NOT NULL CHECK (distribution_type IN ('Single', 'EP', 'Album')),
  artist_name VARCHAR(255) NOT NULL,
  release_title VARCHAR(255) NOT NULL,
  record_label VARCHAR(255),
  primary_genre VARCHAR(100) NOT NULL,
  secondary_genre VARCHAR(100),
  language VARCHAR(100) NOT NULL,
  explicit_lyrics BOOLEAN DEFAULT FALSE,
  instrumental BOOLEAN DEFAULT FALSE,
  version_info VARCHAR(20) DEFAULT 'Normal',
  version_other VARCHAR(255),
  original_release_date DATE,
  previously_released BOOLEAN DEFAULT FALSE,
  album_cover_url TEXT,
  selected_stores JSONB DEFAULT '[]',
  track_price DECIMAL(4,2) DEFAULT 0.99,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'approved', 'rejected', 'published')),
  terms_agreed BOOLEAN DEFAULT FALSE,
  fake_streaming_agreement BOOLEAN DEFAULT FALSE,
  distribution_agreement BOOLEAN DEFAULT FALSE,
  artist_names_agreement BOOLEAN DEFAULT FALSE,
  snapchat_terms BOOLEAN DEFAULT FALSE,
  youtube_music_agreement BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP
)

tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
  track_number INTEGER NOT NULL,
  track_title VARCHAR(255) NOT NULL,
  artist_names TEXT[] DEFAULT '{}',
  featured_artists TEXT[] DEFAULT '{}',
  songwriters JSONB DEFAULT '[]',
  producer_credits JSONB DEFAULT '[]',
  performer_credits JSONB DEFAULT '[]',
  genre VARCHAR(100) NOT NULL,
  audio_file_url TEXT,
  audio_file_name VARCHAR(255),
  isrc VARCHAR(50),
  lyrics_text TEXT,
  has_lyrics BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### Fan Management
```sql
fans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50),
  country VARCHAR(100),
  gender VARCHAR(20),
  age INTEGER,
  birth_year INTEGER,
  subscribed_status VARCHAR(20) DEFAULT 'free' CHECK (subscribed_status IN ('free', 'paid')),
  source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('tip', 'email_capture', 'manual', 'import')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(artist_id, email)
)

email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  link VARCHAR(1000),
  audience_filter JSONB,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'scheduled')),
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### AI Agent System
```sql
ai_chat_messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_user_message BOOLEAN NOT NULL DEFAULT true,
  intent_classified VARCHAR(50),
  data_context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)

ai_artist_context (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  career_description TEXT,
  current_goals TEXT,
  release_strategy TEXT,
  preferred_genres TEXT[],
  target_audience TEXT,
  experience_level VARCHAR(50),
  monthly_release_frequency INTEGER,
  primary_platforms TEXT[],
  collaboration_preferences TEXT,
  marketing_focus TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)
```

#### Financial Management
```sql
withdrawal_requests (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount_usd DECIMAL(10,2) NOT NULL,
  method VARCHAR(100) NOT NULL,
  account_details TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  processed_by INTEGER REFERENCES users(id)
)

payout_methods (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  method VARCHAR(100) NOT NULL,
  account_info TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(artist_id)
)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration with email verification
- `POST /api/auth/login` - User login with device tracking
- `GET /api/auth/me` - Get current user data
- `POST /api/auth/request-password-reset` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/resend-verification` - Resend verification email

### Music Distribution
- `POST /api/distribution/releases` - Create new release
- `GET /api/distribution/releases` - Get artist's releases
- `GET /api/distribution/releases/[id]` - Get specific release with tracks
- `PUT /api/distribution/releases/[id]` - Update release

### Revenue Management
- `POST /api/upload-revenue-report` - Upload TSV/CSV earnings file
- `GET /api/wallet/summary` - Get wallet summary with time filtering
- `GET /api/wallet/history` - Get transaction history
- `POST /api/wallet/request-withdrawal` - Request withdrawal
- `GET /api/wallet/withdrawals` - Get withdrawal history
- `POST /api/wallet/payout-method` - Set payout method

### Fan Management
- `GET /api/fanzone/fans` - Get fans with pagination and filtering
- `POST /api/fanzone/fans` - Add new fan
- `PUT /api/fanzone/fans/[id]` - Update fan
- `DELETE /api/fanzone/fans/[id]` - Delete fan
- `GET /api/fanzone/campaigns` - Get email campaigns
- `POST /api/fanzone/campaigns` - Create email campaign
- `POST /api/fanzone/campaigns/[id]/send` - Send campaign
- `POST /api/fanzone/import` - Import fans from CSV
- `GET /api/fanzone/insights` - Get fan analytics

### AI Agent
- `POST /api/ai-agent/chat` - Send message to AI agent
- `GET /api/ai-agent/chat-history` - Get chat history
- `POST /api/ai-agent/artist-context` - Update artist context
- `POST /api/ai-agent/trigger-onboarding` - Trigger onboarding flow
- `GET /api/ai-agent/notifications/unread-count` - Get unread notifications
- `POST /api/ai-agent/notifications/mark-read` - Mark notifications as read
- `POST /api/ai-agent/notifications/dispatch` - Dispatch notifications (cron)

### Admin Functions
- `GET /api/admin/artists` - Get all artists
- `GET /api/admin/releases` - Get all releases for review
- `PUT /api/admin/releases/[id]` - Approve/reject release
- `GET /api/admin/withdrawals` - Get all withdrawal requests
- `PUT /api/admin/withdrawals/[id]` - Process withdrawal
- `POST /api/admin/analytics-upload` - Upload analytics data
- `GET /api/admin/upload-history` - Get upload history

### Public Endpoints
- `GET /api/landing-page/[artistId]` - Get public artist page
- `POST /api/public/fans/add` - Add fan from public page
- `POST /api/public/verify-paid` - Verify paid fan status

## Frontend Architecture

### Context Providers
- **AuthContext**: Manages authentication state, user data, login/logout
- **ChatContext**: Manages AI chat state, messages, onboarding status

### Key Components

#### Layout Components
- `Sidebar`: Main navigation with active state indicators
- `HeaderSection`: Page headers with user info
- `MobileNavigation`: Bottom navigation for mobile
- `FloatingAgentButton`: AI chat button with unread indicators

#### Feature Components
- `DistributionFlow`: Multi-step release creation
- `WalletSummaryCards`: Earnings overview cards
- `EarningsByPlatformChart`: Platform breakdown visualization
- `FanList`: Fan database with search/filter
- `EmailCampaigns`: Campaign management interface
- `AnalyticsHeader`: Analytics dashboard header

#### UI Components
- Comprehensive Radix UI component library
- Custom ALERA-branded components
- Responsive design with mobile-first approach
- Dark/light theme support

### Page Structure

#### Dashboard Pages
- `/dashboard` - Home with summary cards
- `/dashboard/new-release` - Release creation flow
- `/dashboard/my-music` - Music catalog management
- `/dashboard/analytics` - Performance analytics
- `/dashboard/wallet` - Financial management
- `/dashboard/fanzone` - Fan management
- `/dashboard/my-page` - Public page builder
- `/dashboard/admin` - Admin panel (admin only)

#### Authentication Pages
- `/auth/login` - User login
- `/auth/register` - User registration
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - Password reset form
- `/auth/verify-email` - Email verification

#### Public Pages
- `/p/[slug]` - Public artist landing pages

## Key Features

### Revenue Management
- **File Upload**: Supports TSV/CSV with flexible column mapping
- **Batch Processing**: Handles large files with error reporting
- **Time Filtering**: 7 days, 30 days, 90 days, all time
- **Platform Analytics**: Breakdown by streaming platform
- **Withdrawal System**: Request and approval workflow

### Music Distribution
- **Multi-format Support**: Singles, EPs, Albums with validation
- **Store Selection**: Choose distribution platforms
- **Metadata Management**: ISRC, UPC, songwriter credits
- **Legal Compliance**: Agreement tracking and validation

### Fan Management
- **Comprehensive Database**: Demographics and segmentation
- **Email Marketing**: Campaign creation and tracking
- **Import/Export**: CSV bulk operations
- **Public Pages**: Customizable artist landing pages

### AI-Powered Assistance
- **Context-Aware Responses**: Uses real artist data
- **Intent Classification**: Specialized help routing
- **Onboarding Flow**: 5-step artist profiling
- **Service Integration**: Directs to relevant features

## Security & Performance

### Authentication
- JWT tokens with 7-day expiration
- bcrypt password hashing (12 rounds)
- Email verification required
- Admin role-based access control

### Database
- Connection pooling for performance
- Comprehensive indexing
- Foreign key constraints
- Transaction support for critical operations

### File Handling
- Secure file upload validation
- Batch processing for large files
- Error handling and reporting
- File type restrictions

### AI Integration
- OpenAI API with error handling
- Context size management
- Intent classification for routing
- Fallback responses for API failures

## Deployment

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `OPENAI_API_KEY` - OpenAI API key
- `NEXT_PUBLIC_APP_URL` - Application URL
- Email configuration for notifications

### Vercel Configuration
- Cron jobs for automated notifications
- Environment-specific configurations
- Build optimizations

This architecture provides a scalable, maintainable platform for music artists to manage their careers with comprehensive tools for distribution, analytics, fan engagement, and AI-powered assistance.
