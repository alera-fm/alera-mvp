export const mockWalletData = {
  filter_range: "Last 30 Days",
  summary_cards: {
    total_earnings: 188.26,
    pending_earnings: 42.0,
    withdrawn: 146.26,
    last_payout_date: "2025-06-01",
  },
  earnings_by_platform: [
    {
      platform: "Spotify",
      amount: 102.5,
    },
    {
      platform: "Apple Music",
      amount: 35.0,
    },
    {
      platform: "YouTube",
      amount: 20.0,
    },
    {
      platform: "Tips",
      amount: 15.76,
    },
    {
      platform: "Fanzone",
      amount: 15.0,
    },
  ],
  transactions: [
    {
      date: "2025-06-01",
      type: "Streaming",
      source: "ALERA",
      amount: 42.76,
      status: "Paid",
    },
    {
      date: "2025-06-10",
      type: "Tip",
      source: "ALERA",
      amount: 5.0,
      status: "Paid",
    },
    {
      date: "2025-06-12",
      type: "Fanzone",
      source: "ALERA",
      amount: 5.0,
      status: "Pending",
    },
    {
      date: "2025-06-14",
      type: "Tip",
      source: "ALERA",
      amount: 5.76,
      status: "Paid",
    },
    {
      date: "2025-05-28",
      type: "Streaming",
      source: "ALERA",
      amount: 38.42,
      status: "Paid",
    },
    {
      date: "2025-05-25",
      type: "Fanzone",
      source: "ALERA",
      amount: 10.0,
      status: "Paid",
    },
    {
      date: "2025-05-20",
      type: "Tip",
      source: "ALERA",
      amount: 7.5,
      status: "Paid",
    },
    {
      date: "2025-05-15",
      type: "Streaming",
      source: "ALERA",
      amount: 45.2,
      status: "Paid",
    },
  ],
  earnings_calculator: {
    monthly_streams: 20000,
    monthly_supporters: 8,
    stream_rate: 0.003,
    tip_rate: 2.5,
    sub_rate: 5.0,
    estimated_monthly_earnings: 104.0,
  },
}

// Mock data for different time ranges
export const mockWalletDataByRange = {
  "7 Days": {
    ...mockWalletData,
    filter_range: "7 Days",
    summary_cards: {
      ...mockWalletData.summary_cards,
      total_earnings: 52.76,
      pending_earnings: 15.0,
    },
    earnings_by_platform: [
      { platform: "Spotify", amount: 28.5 },
      { platform: "Apple Music", amount: 12.0 },
      { platform: "YouTube", amount: 7.0 },
      { platform: "Tips", amount: 3.26 },
      { platform: "Fanzone", amount: 2.0 },
    ],
  },
  "30 Days": mockWalletData,
  "90 Days": {
    ...mockWalletData,
    filter_range: "90 Days",
    summary_cards: {
      ...mockWalletData.summary_cards,
      total_earnings: 456.82,
      pending_earnings: 68.0,
    },
    earnings_by_platform: [
      { platform: "Spotify", amount: 245.5 },
      { platform: "Apple Music", amount: 89.0 },
      { platform: "YouTube", amount: 52.0 },
      { platform: "Tips", amount: 38.32 },
      { platform: "Fanzone", amount: 32.0 },
    ],
  },
  "All Time": {
    ...mockWalletData,
    filter_range: "All Time",
    summary_cards: {
      ...mockWalletData.summary_cards,
      total_earnings: 1247.58,
      pending_earnings: 42.0,
    },
    earnings_by_platform: [
      { platform: "Spotify", amount: 678.5 },
      { platform: "Apple Music", amount: 234.0 },
      { platform: "YouTube", amount: 145.0 },
      { platform: "Tips", amount: 98.08 },
      { platform: "Fanzone", amount: 92.0 },
    ],
  },
}
