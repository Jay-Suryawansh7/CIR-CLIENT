// app/layout.tsx
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Civic Issue Feed",
  description: "A community-driven platform for reporting and resolving civic issues.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      // Optional: make routes explicit to match the pages you created
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      appearance={{
        variables: {
          colorPrimary: "#111827",
          colorBackground: "white",
          colorText: "#111827",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className="font-sans bg-white text-gray-900 antialiased">
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
