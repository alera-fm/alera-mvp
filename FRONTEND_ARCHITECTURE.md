# ALERA Frontend Architecture

## Overview
The ALERA frontend is built with Next.js 15 using the App Router, TypeScript, and a modern component-based architecture. It provides a responsive, accessible, and performant user interface for music artists to manage their careers.

## Technology Stack

### Core Framework
- **Next.js 15** with App Router for file-based routing
- **TypeScript** for type safety and developer experience
- **React 19** with modern hooks and context patterns

### Styling & UI
- **Tailwind CSS** for utility-first styling
- **Radix UI** for accessible, unstyled components
- **Framer Motion** for smooth animations and transitions
- **Custom ALERA branding** with purple/yellow color scheme

### State Management
- **React Context** for global state (Auth, Chat)
- **Local state** with useState/useReducer for component state
- **Custom hooks** for reusable logic

### Forms & Validation
- **React Hook Form** for form management
- **Zod** for schema validation
- **Controlled components** with proper error handling

## Project Structure

```
app/
├── globals.css                    # Global styles and CSS variables
├── layout.tsx                     # Root layout with providers
├── page.tsx                       # Home page with auth routing
├── auth/                          # Authentication pages
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   └── verify-email/page.tsx
├── dashboard/                     # Main application
│   ├── layout.tsx                 # Dashboard layout with sidebar
│   ├── page.tsx                   # Dashboard home
│   ├── new-release/page.tsx       # Release creation
│   ├── my-music/page.tsx          # Music catalog
│   ├── analytics/page.tsx         # Performance analytics
│   ├── wallet/page.tsx            # Financial management
│   ├── fanzone/page.tsx           # Fan management
│   ├── my-page/page.tsx           # Public page builder
│   └── admin/page.tsx             # Admin panel
└── p/[slug]/page.tsx              # Public artist pages

components/
├── ui/                            # Reusable UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   ├── tabs.tsx
│   └── [50+ other components]
├── auth/                          # Authentication components
│   ├── auth-layout.tsx
│   ├── login-form.tsx
│   ├── register-form.tsx
│   ├── protected-route.tsx
│   └── admin-route.tsx
├── blocks/                        # Landing page blocks
│   ├── bio-block.tsx
│   ├── release-block.tsx
│   ├── tip-jar-block.tsx
│   ├── video-block.tsx
│   └── [other blocks]
├── analytics/                     # Analytics components
│   ├── connected-accounts-section.tsx
│   ├── spotify-section.tsx
│   ├── youtube-section.tsx
│   └── instagram-section.tsx
├── fanzone/                       # Fan management
│   ├── fan-dashboard.tsx
│   ├── fan-list.tsx
│   ├── email-campaigns.tsx
│   └── import-fans.tsx
├── wallet/                        # Financial components
│   ├── wallet-summary-cards.tsx
│   ├── earnings-by-platform-chart.tsx
│   ├── withdrawal-section.tsx
│   └── transaction-history.tsx
├── distribution/                  # Music distribution
│   └── distribution-flow.tsx
├── my-music/                      # Music catalog
│   ├── [7 music-related components]
├── admin/                         # Admin components
│   ├── analytics-upload.tsx
│   ├── payout-methods-viewer.tsx
│   ├── release-management.tsx
│   └── withdrawal-management.tsx
├── sidebar.tsx                    # Main navigation
├── floating-agent-button.tsx      # AI chat interface
├── header-section.tsx             # Page headers
├── mobile-navigation.tsx          # Mobile nav
└── [other feature components]

context/
├── AuthContext.tsx                # Authentication state
└── ChatContext.tsx                # AI chat state

hooks/
├── use-mobile.tsx                 # Mobile detection
└── use-toast.ts                   # Toast notifications
```

## Component Architecture

### Layout Components

#### Root Layout (`app/layout.tsx`)
```typescript
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <ChatProvider>
              {children}
              <FloatingAgentButton />
              <Toaster />
            </ChatProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

#### Dashboard Layout (`app/dashboard/layout.tsx`)
```typescript
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0a13]">
        <Sidebar />
        <main className="flex-1 p-4 md:p-12 pb-20 md:pb-6 md:ml-64">
          {children}
        </main>
        <FloatingAgentButton />
      </div>
    </ProtectedRoute>
  )
}
```

### Context Providers

#### AuthContext
```typescript
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean | null
  login: (token: string) => void
  logout: () => void
  setUser: (user: User | null) => void
  refreshUser: () => Promise<void>
}

// Provides:
// - Authentication state management
// - User data persistence
// - Login/logout functionality
// - Token management
// - Automatic auth checks
```

#### ChatContext
```typescript
interface ChatContextType {
  isOpen: boolean
  messages: Message[]
  inputValue: string
  isLoading: boolean
  isOnboarding: boolean
  unread: number
  setIsOpen: (open: boolean) => void
  addMessage: (message: Message) => void
  loadChatHistory: () => Promise<void>
  // ... other methods
}

// Provides:
// - AI chat state management
// - Message history persistence
// - Onboarding flow control
// - Unread notification tracking
// - Chat history loading
```

### Key Feature Components

#### Sidebar Navigation (`components/sidebar.tsx`)
- **Responsive design** with mobile/desktop variants
- **Active state indicators** with smooth animations
- **Admin route protection** with conditional rendering
- **Theme toggle** integration
- **Smooth hover effects** with Framer Motion

#### Floating Agent Button (`components/floating-agent-button.tsx`)
- **Persistent chat interface** with message history
- **Intent classification** for specialized responses
- **Onboarding flow** integration
- **Unread message indicators**
- **Mobile-responsive** design
- **Real-time message updates**

#### Distribution Flow (`components/distribution/distribution-flow.tsx`)
- **Multi-step form** with validation
- **File upload** for audio tracks
- **Store selection** with pricing
- **Legal agreement** management
- **Progress tracking** and error handling

#### Wallet Components
- **Summary Cards** (`wallet-summary-cards.tsx`): Key metrics display
- **Platform Chart** (`earnings-by-platform-chart.tsx`): Visual analytics
- **Withdrawal Section** (`withdrawal-section.tsx`): Payout requests
- **Transaction History** (`transaction-history.tsx`): Financial records

#### Fan Management
- **Fan Dashboard** (`fan-dashboard.tsx`): Analytics overview
- **Fan List** (`fan-list.tsx`): Database with search/filter
- **Email Campaigns** (`email-campaigns.tsx`): Marketing tools
- **Import Fans** (`import-fans.tsx`): Bulk operations

## Styling Architecture

### Tailwind Configuration
```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        alera: {
          purple: {
            dark: "#1A0B2E",
            DEFAULT: "#2F1A45",
            light: "#513A6B",
          },
          yellow: {
            DEFAULT: "#E1FF3F",
            light: "#F1FF94",
          },
        },
        // ... other custom colors
      },
    },
  },
}
```

### CSS Variables
```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 262.1 83.3% 57.8%;
  --primary-foreground: 210 40% 98%;
  /* ... other variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode variables */
}
```

### Component Styling Patterns
- **Utility-first** approach with Tailwind
- **Component variants** using class-variance-authority
- **Responsive design** with mobile-first approach
- **Dark mode** support with CSS variables
- **Consistent spacing** and typography scales

## State Management Patterns

### Global State (Context)
```typescript
// Authentication state
const { user, isAuthenticated, login, logout } = useAuth()

// Chat state
const { messages, isOpen, addMessage, loadChatHistory } = useChat()
```

### Local State Patterns
```typescript
// Form state with React Hook Form
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: initialData
})

// Component state
const [loading, setLoading] = useState(false)
const [data, setData] = useState(null)

// Custom hooks for reusable logic
const { isMobile } = useMobile()
const { toast } = useToast()
```

### Data Fetching Patterns
```typescript
// Effect-based fetching
useEffect(() => {
  if (user?.id) {
    fetchData()
  }
}, [user?.id])

// Async data loading
const fetchData = async () => {
  try {
    setLoading(true)
    const response = await fetch('/api/endpoint', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    setData(data)
  } catch (error) {
    toast({ title: "Error", description: "Failed to load data" })
  } finally {
    setLoading(false)
  }
}
```

## Routing Architecture

### App Router Structure
```
/ (root)
├── Redirects to /dashboard or /auth/login based on auth state
├── /auth/* (authentication routes)
│   ├── /login - User login form
│   ├── /register - User registration
│   ├── /forgot-password - Password reset request
│   ├── /reset-password - Password reset form
│   └── /verify-email - Email verification
├── /dashboard/* (protected routes)
│   ├── / - Dashboard home with summary
│   ├── /new-release - Release creation flow
│   ├── /my-music - Music catalog management
│   ├── /analytics - Performance analytics
│   ├── /wallet - Financial management
│   ├── /fanzone - Fan management
│   ├── /my-page - Public page builder
│   └── /admin - Admin panel (admin only)
└── /p/[slug] - Public artist pages
```

### Route Protection
```typescript
// Protected routes
<ProtectedRoute>
  <DashboardContent />
</ProtectedRoute>

// Admin routes
<AdminRoute>
  <AdminContent />
</AdminRoute>
```

## Performance Optimizations

### Code Splitting
- **Automatic route-based** splitting with App Router
- **Dynamic imports** for heavy components
- **Lazy loading** for non-critical features

### Image Optimization
```typescript
// Next.js Image component
<Image
  src="/alera-logo-white.png"
  alt="ALERA Logo"
  width={32}
  height={32}
  className="rounded-sm"
/>
```

### Bundle Optimization
- **Tree shaking** with ES modules
- **Dead code elimination**
- **Minimal bundle size** with selective imports

## Accessibility Features

### Radix UI Components
- **Keyboard navigation** support
- **Screen reader** compatibility
- **Focus management** and trapping
- **ARIA attributes** and roles

### Custom Accessibility
```typescript
// Proper semantic HTML
<main role="main">
  <h1>Page Title</h1>
  <nav aria-label="Main navigation">
    {/* Navigation items */}
  </nav>
</main>

// Form accessibility
<Label htmlFor="email">Email Address</Label>
<Input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid={!!error}
/>
{error && (
  <p id="email-error" role="alert">
    {error.message}
  </p>
)}
```

## Mobile Responsiveness

### Responsive Design Patterns
```typescript
// Mobile-first approach
<div className="flex flex-col md:flex-row">
  <div className="w-full md:w-1/2">
    {/* Content */}
  </div>
</div>

// Conditional rendering
{isMobile ? <MobileNavigation /> : <Sidebar />}

// Responsive breakpoints
// sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
```

### Mobile-Specific Components
- **Bottom navigation** for mobile devices
- **Touch-friendly** button sizes
- **Swipe gestures** for navigation
- **Mobile-optimized** forms and inputs

## Error Handling

### Error Boundaries
```typescript
// Global error handling
<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>
```

### Form Validation
```typescript
// Zod schema validation
const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password too short")
})

// Form error handling
const form = useForm({
  resolver: zodResolver(schema)
})
```

### API Error Handling
```typescript
// Consistent error handling
try {
  const response = await fetch('/api/endpoint')
  if (!response.ok) {
    throw new Error('API request failed')
  }
  const data = await response.json()
} catch (error) {
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive"
  })
}
```

## Development Patterns

### Component Structure
```typescript
// Standard component pattern
interface ComponentProps {
  data: DataType
  onAction: (value: string) => void
  className?: string
}

export function Component({ data, onAction, className }: ComponentProps) {
  const [state, setState] = useState(initialState)
  
  useEffect(() => {
    // Side effects
  }, [dependencies])
  
  const handleAction = useCallback((value: string) => {
    onAction(value)
  }, [onAction])
  
  return (
    <div className={cn("base-styles", className)}>
      {/* Component content */}
    </div>
  )
}
```

### Custom Hooks
```typescript
// Reusable logic extraction
export function useWalletData(artistId: string) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchWalletData(artistId).then(setData).finally(() => setLoading(false))
  }, [artistId])
  
  return { data, loading }
}
```

This frontend architecture provides a scalable, maintainable, and performant foundation for the ALERA platform, with modern React patterns, comprehensive accessibility, and responsive design.
