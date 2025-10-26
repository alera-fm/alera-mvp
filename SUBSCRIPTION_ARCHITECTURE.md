# ALERA Subscription Architecture

## Overview

ALERA implements a 3-tier subscription system with a one-release free trial that funnels users into paid Plus or Pro tiers. The system includes feature gating, usage tracking, and Stripe integration for payment processing.

## Subscription Tiers

### 1. **Trial (Free - One Single)**

- **Duration**: Until first release submission (not time-based)
- **Access**: Full feature access with specific limitations
- **Limitations**:
  - **Release Limit**: ONE free Single release allowed (1 song only)
  - **Release Type**: Singles only (EPs and Albums require Plus/Pro)
  - **AI Agent**: 1,500 tokens per day
- **Expiration Behavior**: Trial ends immediately after successful release submission, user must upgrade to create more releases

### 2. **Plus ($4.99/month)**

- **Access**: Most features with specific limitations
- **Limitations**:
  - **Fan Zone**: Only "Dashboard" and "Fans" tabs accessible
  - **Campaigns & Import**: Locked with "Upgrade to Pro" prompt
  - **Direct Monetization**: Tip Jar and Paid Subscriptions disabled
  - **AI Agent**: 100,000 tokens per month (resets 30 days from subscription)
- **Billing**: Monthly via Stripe

### 3. **Pro ($14.99/month)**

- **Access**: Unlimited access to all features
- **Limitations**: None
- **Billing**: Monthly via Stripe

## Database Schema

### Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('trial', 'plus', 'pro')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  trial_expires_at TIMESTAMP,
  subscription_expires_at TIMESTAMP,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_expires ON subscriptions(trial_expires_at, subscription_expires_at);
```

### AI Usage Tracking

```sql
CREATE TABLE ai_usage (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tokens_used INTEGER DEFAULT 0,
  usage_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, usage_date)
);

-- Indexes
CREATE INDEX idx_ai_usage_user_date ON ai_usage(user_id, usage_date);
CREATE INDEX idx_ai_usage_date ON ai_usage(usage_date);
```

### Release Tracking (Using Existing Table)

```sql
-- Use existing releases table
-- Count releases WHERE artist_id = user_id AND status = 'under_review'
-- No additional table needed
```

## Backend Architecture

### Subscription Middleware

```typescript
// lib/subscription-middleware.ts
interface SubscriptionCheck {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: "plus" | "pro";
  remainingUsage?: number;
}

export async function checkSubscriptionAccess(
  userId: number,
  feature: FeatureType,
  additionalData?: any
): Promise<SubscriptionCheck>;

// Feature types
type FeatureType =
  | "release_creation"
  | "ai_agent"
  | "fan_campaigns"
  | "fan_import"
  | "tip_jar"
  | "paid_subscriptions"
  | "analytics_advanced";
```

### API Endpoints

#### Subscription Management

```typescript
// /api/subscription/status
GET - Get current subscription status and limits

// /api/subscription/create
POST - Create new subscription via Stripe

// /api/subscription/cancel
POST - Cancel current subscription

// /api/subscription/usage
GET - Get current usage statistics (AI tokens, releases, etc.)
```

#### Stripe Integration

```typescript
// /api/stripe/create-checkout-session
POST - Create Stripe checkout session for subscription

// /api/stripe/webhook
POST - Handle Stripe webhook events

// /api/stripe/customer-portal
POST - Create customer portal session for subscription management
```

### Feature Gating Logic

#### Release Limits (Trial Users)

```typescript
const checkReleaseLimit = async (
  userId: number
): Promise<SubscriptionCheck> => {
  const subscription = await getSubscription(userId);

  if (subscription.tier !== "trial") {
    return { allowed: true };
  }

  const pendingReleases = await query(
    `
    SELECT COUNT(*) FROM releases 
    WHERE artist_id = $1 AND status = 'under_review'
  `,
    [userId]
  );

  if (pendingReleases.rows[0].count >= 1) {
    return {
      allowed: false,
      reason: "Trial users can only have 1 pending release",
      upgradeRequired: "plus",
    };
  }

  return { allowed: true };
};
```

#### AI Token Limits

```typescript
const checkAITokens = async (
  userId: number,
  requestedTokens: number
): Promise<SubscriptionCheck> => {
  const subscription = await getSubscription(userId);
  const now = new Date();

  if (subscription.tier === "pro") {
    return { allowed: true };
  }

  if (subscription.tier === "trial") {
    // Daily limit: 1,500 tokens
    const todayUsage = await getDailyTokenUsage(userId, now);
    const remainingTokens = 1500 - todayUsage;

    if (requestedTokens > remainingTokens) {
      return {
        allowed: false,
        reason: "Daily AI token limit exceeded",
        upgradeRequired: "pro",
        remainingUsage: remainingTokens,
      };
    }
  }

  if (subscription.tier === "plus") {
    // Monthly limit: 100,000 tokens (resets 30 days from subscription)
    const monthlyUsage = await getMonthlyTokenUsage(
      userId,
      subscription.created_at
    );
    const remainingTokens = 100000 - monthlyUsage;

    if (requestedTokens > remainingTokens) {
      return {
        allowed: false,
        reason: "Monthly AI token limit exceeded",
        upgradeRequired: "pro",
        remainingUsage: remainingTokens,
      };
    }
  }

  return { allowed: true };
};
```

#### Fan Zone Access (Plus Users)

```typescript
const checkFanZoneAccess = async (
  userId: number,
  tab: string
): Promise<SubscriptionCheck> => {
  const subscription = await getSubscription(userId);

  if (subscription.tier === "pro" || subscription.tier === "trial") {
    return { allowed: true };
  }

  if (subscription.tier === "plus") {
    const allowedTabs = ["dashboard", "fans"];
    if (!allowedTabs.includes(tab.toLowerCase())) {
      return {
        allowed: false,
        reason: "Plus tier can only access Dashboard and Fans tabs",
        upgradeRequired: "pro",
      };
    }
  }

  return { allowed: true };
};
```

## Frontend Architecture

### Subscription Context

```typescript
// context/SubscriptionContext.tsx
interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  isTrialExpired: boolean;
  daysRemaining: number;
  canAccessFeature: (feature: string, data?: any) => Promise<boolean>;
  showUpgradeDialog: (reason: string, requiredTier: "plus" | "pro") => void;
  refreshSubscription: () => Promise<void>;
  usage: {
    aiTokens: {
      used: number;
      limit: number;
      resetDate: Date;
    };
    releases: {
      pending: number;
      limit: number;
    };
  };
}
```

### Feature Gating Components

#### FeatureGate Wrapper

```typescript
// components/subscription/FeatureGate.tsx
interface FeatureGateProps {
  feature: string;
  tier?: "plus" | "pro";
  children: ReactNode;
  fallback?: ReactNode;
  data?: any;
}

export function FeatureGate({
  feature,
  tier,
  children,
  fallback,
  data,
}: FeatureGateProps) {
  const { canAccessFeature, showUpgradeDialog } = useSubscription();
  const [hasAccess, setHasAccess] = useState(false);

  // Check access and show upgrade dialog if needed
  // Render children if access granted, fallback if not
}
```

#### Upgrade Dialog

```typescript
// components/subscription/UpgradeDialog.tsx
interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  requiredTier: "plus" | "pro";
  currentTier: string;
}

export function UpgradeDialog({
  isOpen,
  onClose,
  reason,
  requiredTier,
  currentTier,
}: UpgradeDialogProps) {
  // Modal dialog with:
  // - Current limitation explanation
  // - Tier comparison
  // - Stripe checkout integration
  // - No redirect, modal-only
}
```

#### Trial Countdown

```typescript
// components/subscription/TrialCountdown.tsx
export function TrialCountdown() {
  const { subscription, daysRemaining } = useSubscription();

  if (subscription?.tier !== "trial") return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
            Trial Period
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            {daysRemaining} days remaining in your free trial
          </p>
        </div>
        <Button
          onClick={() => showUpgradeDialog("Trial expiring soon", "plus")}
        >
          Upgrade Now
        </Button>
      </div>
    </div>
  );
}
```

### UI Integration Points

#### Dashboard Integration

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SubscriptionProvider>
      <ProtectedRoute>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1">
            <TrialCountdown />
            {children}
          </main>
        </div>
      </ProtectedRoute>
    </SubscriptionProvider>
  );
}
```

#### Fan Zone Tab Locking

```typescript
// app/dashboard/fanzone/page.tsx
<Tabs defaultValue="dashboard">
  <TabsList>
    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
    <TabsTrigger value="fans">Fans</TabsTrigger>

    <FeatureGate feature="fan_campaigns" tier="pro">
      <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
    </FeatureGate>

    <FeatureGate feature="fan_import" tier="pro">
      <TabsTrigger value="import">Import</TabsTrigger>
    </FeatureGate>
  </TabsList>

  <TabsContent value="campaigns">
    <FeatureGate
      feature="fan_campaigns"
      tier="pro"
      fallback={<UpgradePrompt feature="Email Campaigns" requiredTier="pro" />}
    >
      <EmailCampaigns />
    </FeatureGate>
  </TabsContent>
</Tabs>
```

#### Release Flow Gating

```typescript
// components/distribution/distribution-flow.tsx
const handleReleaseSubmit = async (releaseData) => {
  const canCreate = await canAccessFeature("release_creation", releaseData);

  if (!canCreate) {
    showUpgradeDialog("Release limit exceeded", "plus");
    return;
  }

  // Proceed with release creation
};
```

#### AI Agent Token Tracking

```typescript
// app/api/ai-agent/chat/route.ts
export async function POST(request: NextRequest) {
  const decoded = verifyToken(token)
  const { message } = await request.json()

  // Estimate tokens needed
  const estimatedTokens = estimateTokenCount(message)

  // Check limits
  const canUseAI = await checkAITokens(decoded.userId, estimatedTokens)
  if (!canUseAI.allowed) {
    return NextResponse.json({
      error: canUseAI.reason,
      upgradeRequired: canUseAI.upgradeRequired,
      remainingUsage: canUseAI.remainingUsage
    }, { status: 429 })
  }

  // Process AI request
  const response = await generateAIResponse(...)

  // Track actual token usage
  const actualTokens = countTokens(response)
  await trackAIUsage(decoded.userId, actualTokens)

  return NextResponse.json({ response })
}
```

## Stripe Integration

### Webhook Events

```typescript
// app/api/stripe/webhook/route.ts
export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature");
  const body = await request.text();

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case "customer.subscription.created":
      await handleSubscriptionCreated(event.data.object);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionCancelled(event.data.object);
      break;
    case "invoice.payment_succeeded":
      await handlePaymentSucceeded(event.data.object);
      break;
    case "invoice.payment_failed":
      await handlePaymentFailed(event.data.object);
      break;
  }

  return NextResponse.json({ received: true });
}
```

### Subscription Lifecycle

```typescript
const handleSubscriptionCreated = async (subscription: Stripe.Subscription) => {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0].price.id;

  // Determine tier from price ID
  const tier = priceId === process.env.STRIPE_PLUS_PRICE_ID ? "plus" : "pro";

  // Update user subscription
  await query(
    `
    UPDATE subscriptions 
    SET tier = $1, status = 'active', 
        stripe_subscription_id = $2,
        subscription_expires_at = $3
    WHERE stripe_customer_id = $4
  `,
    [
      tier,
      subscription.id,
      new Date(subscription.current_period_end * 1000),
      customerId,
    ]
  );
};
```

## Migration Strategy

### Existing Users Migration

```sql
-- Migration: Add subscription records for existing users
INSERT INTO subscriptions (user_id, tier, status, trial_expires_at)
SELECT
  id as user_id,
  'trial' as tier,
  'active' as status,
  (created_at + INTERVAL '1 month') as trial_expires_at
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM subscriptions WHERE subscriptions.user_id = users.id
);
```

### Data Migration Steps

1. **Create subscription tables**
2. **Migrate existing users to trial status**
3. **Set trial expiration dates based on registration**
4. **Initialize AI usage tracking**
5. **Update existing API endpoints with subscription checks**

## Feature Rollout Plan

### Phase 1: Database & Backend Foundation

- [ ] Create subscription tables
- [ ] Implement subscription middleware
- [ ] Add subscription checks to existing APIs
- [ ] Migrate existing users to trial

### Phase 2: Stripe Integration

- [ ] Set up Stripe configuration
- [ ] Implement checkout session creation
- [ ] Add webhook handlers
- [ ] Test subscription lifecycle

### Phase 3: Frontend Subscription System

- [ ] Create subscription context
- [ ] Implement upgrade dialog
- [ ] Add trial countdown component
- [ ] Create feature gating components

### Phase 4: Feature-Specific Implementation

- [ ] Release flow restrictions
- [ ] AI agent token tracking and limits
- [ ] Fan Zone tab locking
- [ ] Landing page monetization gating

### Phase 5: Testing & Polish

- [ ] End-to-end subscription flow testing
- [ ] Edge case handling
- [ ] UI polish and error states
- [ ] Performance optimization

## Environment Variables

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Product IDs
STRIPE_PLUS_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...

# App Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Security Considerations

### Subscription Verification

- Always verify subscription status server-side
- Never trust client-side subscription data
- Validate Stripe webhook signatures
- Implement rate limiting for subscription checks

### Token Usage Tracking

- Track actual AI token usage, not estimates
- Implement daily/monthly reset logic
- Handle edge cases (timezone differences, leap years)
- Prevent token usage manipulation

### Access Control

- Implement middleware for all protected endpoints
- Use database transactions for subscription changes
- Log subscription changes for audit trail
- Handle subscription expiration gracefully

This architecture provides a comprehensive subscription system that scales with the business while maintaining security and user experience standards.
