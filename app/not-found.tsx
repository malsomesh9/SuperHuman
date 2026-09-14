import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="text-center">
        <h1 className="text-2xl font-semibold">This page does not exist.</h1>
        <p className="mt-2 text-sm text-muted-foreground">The item may have moved or been deleted.</p>
        <Button asChild className="mt-5"><Link href="/today">Back to Today</Link></Button>
      </section>
    </main>
  );
}
