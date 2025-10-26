// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

// Avoid static 404s in certain setups
export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <SignIn
        // Default destinations (used if no ?redirect_url is present)
        afterSignInUrl="/admin"
        afterSignUpUrl="/admin"
      />
    </div>
  );
}
