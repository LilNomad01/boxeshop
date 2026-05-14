import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <Card>
        <CardContent className="p-12 text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
          <h1 className="text-3xl font-bold">Comandă plasată cu succes!</h1>
          <p className="text-muted-foreground">
            Mulțumim pentru comandă. Te vom contacta în scurt timp pentru a confirma livrarea.
          </p>
          {sp.orderId && (
            <p className="text-sm">
              Număr comandă: <code className="bg-muted px-2 py-1 rounded">{sp.orderId.slice(0, 8)}</code>
            </p>
          )}
          <div className="pt-4">
            <Link href="/">
              <Button variant="outline">Înapoi la magazin</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
