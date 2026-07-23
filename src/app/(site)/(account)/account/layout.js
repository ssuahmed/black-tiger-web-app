import AccountShell from "@/components/account/AccountShell";

/** @param {{ children: import('react').ReactNode }} props */
export default function AccountLayout({ children }) {
  return <AccountShell>{children}</AccountShell>;
}
