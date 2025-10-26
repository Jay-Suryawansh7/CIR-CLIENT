// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <SignUp
        // Default destinations (used if no ?redirect_url is present)
        afterSignInUrl="/admin"
        afterSignUpUrl="/admin"
      />
    </div>
  );
}
