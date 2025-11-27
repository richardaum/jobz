import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui";
import { Label } from "@/shared/ui";
import { Textarea } from "@/shared/ui";

interface OutputCardProps {
  title: string;
  description: string;
  value: string;
  placeholder: string;
  id: string;
}

export function OutputCard({ title, description, value, placeholder, id }: OutputCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor={id}>{title}</Label>
          <Textarea id={id} readOnly value={value} placeholder={placeholder} className="min-h-[300px]" />
        </div>
      </CardContent>
    </Card>
  );
}

