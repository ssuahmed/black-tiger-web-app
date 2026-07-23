import { Suspense } from "react";
import { LoadingCenter } from "@/components/ui";
import SignInClient from "./SignInClient";

export default async function SignInPage(props) {
  const searchParams = await props.searchParams;
  const initialIntent = searchParams?.intent === "register" ? "register" : "login";
  return (
    <Suspense fallback={<LoadingCenter className="min-h-[50vh]" />}>
      <SignInClient initialIntent={initialIntent} />
    </Suspense>
  );
}
