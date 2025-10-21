// Admin Dashboard Type Definitions

export interface ActionableItems {
  pendingReleases: number;
  pendingIdentityVerifications: number;
  pendingPayoutRequests: number;
  pendingPayoutMethods: number;
  takedownRequests: number;
}

export interface KeyMetrics {
  newUsersLast7Days: number;
  newReleasesLast7Days: number;
  newPayingSubscribersThisMonth: number;
  monthlyRecurringRevenue: number;
}

export interface TimeSeriesData {
  date: string;
  count: number;
}

export interface ConversionData {
  month: string;
  rate: number;
}

export interface PerformanceMetrics {
  newUsersOverTime: TimeSeriesData[];
  newReleasesOverTime: TimeSeriesData[];
  trialToPaidConversion: ConversionData[];
}

export interface DashboardStats {
  actionableItems: ActionableItems;
  keyMetrics: KeyMetrics;
  performanceMetrics: PerformanceMetrics;
}

export interface SearchResult {
  type: "user" | "release";
  id: string | number;
  title: string;
  subtitle: string;
}
