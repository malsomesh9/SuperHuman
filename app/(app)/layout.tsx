import { ProtectedApp } from "@/components/layout/protected-app";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedApp>{children}</ProtectedApp>;
}
