import { IconCopy, IconDownload, IconLoader2, IconX } from "@tabler/icons-react";

import { Button } from "@/shared/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui";
import { Label } from "@/shared/ui";
import { Textarea } from "@/shared/ui";

import { ResumeChangesTooltip } from "./resume-changes-tooltip";

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
  changes?: { section: string; description: string }[];
  onHide?: () => void;
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
  changes = [],
  onHide,
}: OutputCardProps) {
  const hasActions = (showDownload && onDownload && value.trim()) || (showCopy && onCopy && value.trim());

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle>{title}</CardTitle>
              <ResumeChangesTooltip changes={changes} hasValue={!!value.trim()} />
            </div>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="ml-4 flex items-center gap-2 shrink-0">
            {isLoading ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" style={{ animationDuration: "1s" }} />
                <span className="text-sm text-muted-foreground">Processing...</span>
              </>
            ) : (
              <>
                {hasActions && (
                  <>
                    {showCopy && onCopy && value.trim() && (
                      <Button variant="outline" size="sm" onClick={onCopy} type="button">
                        <IconCopy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    )}
                    {showDownload && onDownload && value.trim() && (
                      <Button variant="outline" size="sm" onClick={onDownload} type="button">
                        <IconDownload className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    )}
                  </>
                )}
                {onHide && (
                  <Button variant="ghost" size="sm" onClick={onHide} type="button" title="Hide card">
                    <IconX className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 flex-1 flex flex-col min-h-0">
          <Label htmlFor={id}>{title}</Label>
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center min-h-0 border border-input rounded-md bg-muted/50">
              <div className="flex flex-col items-center gap-2">
                <IconLoader2
                  className="h-8 w-8 animate-spin text-muted-foreground"
                  style={{ animationDuration: "1s" }}
                />
                <p className="text-sm text-muted-foreground">Processing...</p>
              </div>
            </div>
          ) : (
            <Textarea id={id} readOnly value={value} placeholder={placeholder} className="flex-1 min-h-0" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
