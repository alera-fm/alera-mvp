import { WelcomePage } from "@/components/auth/welcome-page"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function WelcomePageRoute() {
  return (
    <AuthLayout>
      <WelcomePage />
    </AuthLayout>
  )
}
