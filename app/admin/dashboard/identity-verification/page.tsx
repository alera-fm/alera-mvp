"use client";

import { IdentityVerificationReview } from "@/components/admin/identity-verification-review";

export default function IdentityVerificationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Identity Verification
        </h1>
        <p className="text-muted-foreground">
          Review and approve user identity verification requests
        </p>
      </div>
      <IdentityVerificationReview />
    </div>
  );
}
