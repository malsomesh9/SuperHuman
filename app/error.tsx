"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="p-6"><ErrorState title="SmartEmail hit an error." body="Refresh this view or return to Today." onRetry={reset} /></main>;
}
