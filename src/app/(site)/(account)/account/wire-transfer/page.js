import { Suspense } from "react";
import AccountWireTransferClient from "@/components/account/AccountWireTransferClient";
import { LoadingCenter } from "@/components/ui";

export default function AccountWireTransferPage() {
  return (
    <Suspense fallback={<LoadingCenter className="min-h-[30vh]" />}>
      <AccountWireTransferClient />
    </Suspense>
  );
}
