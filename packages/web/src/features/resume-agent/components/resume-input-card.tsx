import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui";
import { Label } from "@/shared/ui";
import { Textarea } from "@/shared/ui";

interface ResumeInputCardProps {
  value: string;
  onChange: (value: string) => void;
}

export function ResumeInputCard({ value, onChange }: ResumeInputCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume</CardTitle>
        <CardDescription>Paste your current resume here</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="resume">Resume Content</Label>
          <Textarea
            id="resume"
            placeholder="Paste your resume here..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[300px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}

