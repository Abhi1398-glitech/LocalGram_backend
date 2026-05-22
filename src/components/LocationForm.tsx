import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { Location } from "@/lib/posts";

type Props = {
  initial?: Location | null;
  onSubmit: (loc: Location) => void;
};

export function LocationForm({ initial, onSubmit }: Props) {
  const [city, setCity] = useState(initial?.city ?? "");
  const [area, setArea] = useState(initial?.area ?? "");
  const [pincode, setPincode] = useState(initial?.pincode ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = city.trim();
    const a = area.trim();
    const p = pincode.trim();
    if (!c || !a) {
      setError("Please fill in city and area.");
      return;
    }
    if (!/^\d{4,10}$/.test(p)) {
      setError("Pincode must be 4–10 digits.");
      return;
    }
    setError(null);
    onSubmit({ city: c, area: a, pincode: p });
  };

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MapPin className="h-6 w-6" />
        </div>
        <CardTitle className="mt-2 text-2xl">Set your neighborhood</CardTitle>
        <CardDescription>
          See and share posts from people right around you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bengaluru"
                maxLength={60}
                autoComplete="address-level2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Input
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Indiranagar"
                maxLength={60}
                autoComplete="address-level3"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
              placeholder="560038"
              inputMode="numeric"
              maxLength={10}
              autoComplete="postal-code"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" size="lg">
            Set Location
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
