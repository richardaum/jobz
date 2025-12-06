import { IconCode, IconCopy, IconDownload, IconLoader2, IconX } from "@tabler/icons-react";
import { toast } from "sonner";

import { AdaptedResumeViewer, type ResumeChange, type ResumeSection } from "@/entities/resume";
import { copyToClipboard } from "@/shared/lib";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Textarea } from "@/shared/ui";

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
  changes?: ResumeChange[];
  sections?: ResumeSection[];
  onHide?: () => void;
  useStructuredView?: boolean; // Use AdaptedResumeViewer instead of textarea
  rawResponseJson?: string | null; // Full JSON response from AI
  onCopyJson?: () => void;
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
  sections,
  onHide,
  useStructuredView = false,
  rawResponseJson,
  onCopyJson,
}: OutputCardProps) {
  const shouldShowCopy = (showCopy || useStructuredView) && value.trim();

  const handleCopy = async () => {
    if (onCopy) {
      await onCopy();
    } else {
      const success = await copyToClipboard(value);
      if (success) {
        toast.success("Copied to clipboard!");
      } else {
        toast.error("Failed to copy to clipboard");
      }
    }
  };

  const handleCopyJson = async () => {
    if (onCopyJson) {
      await onCopyJson();
    } else if (rawResponseJson) {
      const success = await copyToClipboard(rawResponseJson);
      if (success) {
        toast.success("JSON copied to clipboard!");
      } else {
        toast.error("Failed to copy JSON to clipboard");
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="ml-4 flex items-center gap-2 shrink-0">
            {isLoading ? (
              <>
                <IconLoader2
                  className="h-4 w-4 animate-spin text-muted-foreground"
                  style={{ animationDuration: "1s" }}
                />
                <span className="text-sm text-muted-foreground">Processing...</span>
              </>
            ) : (
              <>
                {shouldShowCopy && (
                  <Button variant="outline" size="sm" onClick={handleCopy} type="button">
                    <IconCopy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                )}
                {rawResponseJson && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyJson}
                    type="button"
                    title="Copy AI JSON response"
                  >
                    <IconCode className="h-4 w-4 mr-2" />
                    Copy JSON
                  </Button>
                )}
                {showDownload && onDownload && value.trim() && (
                  <Button variant="outline" size="sm" onClick={onDownload} type="button">
                    <IconDownload className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
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
          ) : useStructuredView ? (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <AdaptedResumeViewer content={value} changes={changes} sections={sections} isLoading={isLoading} />
            </div>
          ) : (
            <Textarea id={id} readOnly value={value} placeholder={placeholder} className="flex-1 min-h-0" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
