import { SignUp } from "@clerk/nextjs";
import { PageViewTracker } from "@/components/ui/page-view-tracker";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <PageViewTracker event="sign_up_viewed" />
      <SignUp />
    </div>
  );
}
