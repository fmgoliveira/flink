import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignUp
      path="/auth/sign-up"
      fallbackRedirectUrl="/dashboard"
      afterSignOutUrl="/dashboard"
      signInUrl="/auth/sign-in"
    />
  );
}
