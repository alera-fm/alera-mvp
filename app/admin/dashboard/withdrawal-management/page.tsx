"use client";

import { WithdrawalManagement } from "@/components/admin/withdrawal-management";
import { PayoutMethodsViewer } from "@/components/admin/payout-methods-viewer";

export default function WithdrawalManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Withdrawal Management
        </h1>
        <p className="text-muted-foreground">
          Process withdrawal requests and manage payout methods
        </p>
      </div>
      <div className="grid gap-6">
        <WithdrawalManagement />
        <PayoutMethodsViewer />
      </div>
    </div>
  );
}
