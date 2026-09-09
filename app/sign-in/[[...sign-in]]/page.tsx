import { SignIn } from "@clerk/nextjs";
import { PageViewTracker } from "@/components/ui/page-view-tracker";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <PageViewTracker event="sign_in_viewed" />
      <SignIn />
    </div>
  );
}
