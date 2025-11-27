import { IconCopy, IconDownload } from "@tabler/icons-react";

import { Button } from "@/shared/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui";
import { Label } from "@/shared/ui";
import { Textarea } from "@/shared/ui";

interface OutputCardProps {
  title: string;
  description: string;
  value: string;
  placeholder: string;
  id: string;
  onDownload?: () => void;
  showDownload?: boolean;
  onCopy?: () => void;
  showCopy?: boolean;
}

export function OutputCard({
  title,
  description,
  value,
  placeholder,
  id,
  onDownload,
  showDownload = false,
  onCopy,
  showCopy = false,
}: OutputCardProps) {
  const hasActions = (showDownload && onDownload && value.trim()) || (showCopy && onCopy && value.trim());

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {hasActions && (
            <div className="ml-4 flex gap-2 shrink-0">
              {showCopy && onCopy && value.trim() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCopy}
                  type="button"
                >
                  <IconCopy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              )}
              {showDownload && onDownload && value.trim() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDownload}
                  type="button"
                >
                  <IconDownload className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              )}
            </div>
          )}
        </div>
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

