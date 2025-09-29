import { Suspense } from "react"
import { WelcomePage } from "@/components/auth/welcome-page"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function WelcomePageRoute() {
  return (
    <AuthLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <WelcomePage />
      </Suspense>
    </AuthLayout>
  )
}
