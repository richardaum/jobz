import { IconCopy, IconDownload, IconLoader2 } from "@tabler/icons-react";

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
  isLoading?: boolean;
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
  isLoading = false,
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
          {isLoading ? (
            <div className="ml-4 flex items-center gap-2 shrink-0">
              <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" style={{ animationDuration: "1s" }} />
              <span className="text-sm text-muted-foreground">Processing...</span>
            </div>
          ) : (
            hasActions && (
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
            )
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor={id}>{title}</Label>
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[300px] border border-input rounded-md bg-muted/50">
              <div className="flex flex-col items-center gap-2">
                <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" style={{ animationDuration: "1s" }} />
                <p className="text-sm text-muted-foreground">Processing...</p>
              </div>
            </div>
          ) : (
            <Textarea id={id} readOnly value={value} placeholder={placeholder} className="min-h-[300px]" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

