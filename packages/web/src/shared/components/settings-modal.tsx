"use client";

import { IconInfoCircle, IconSettings } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { useSettingsStore } from "@/shared/stores";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input, Label } from "@/shared/ui";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const openaiApiKey = useSettingsStore((state) => state.openaiApiKey);
  const setOpenAIApiKey = useSettingsStore((state) => state.setOpenAIApiKey);
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      // Load current API key from store when modal opens
      setApiKey(openaiApiKey || "");
    }
  }, [open, openaiApiKey]);

  const handleSave = () => {
    setIsSaving(true);
    try {
      setOpenAIApiKey(apiKey);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save API key:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg origin-top-right data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-right-4 data-[state=closed]:slide-out-to-top-4 data-[state=open]:slide-in-from-right-4 data-[state=open]:slide-in-from-top-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <IconSettings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Configure your application settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* OpenAI API Key Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai-api-key" className="text-sm font-medium text-foreground">
                OpenAI API Key
              </Label>
              <Input
                id="openai-api-key"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono text-sm bg-background"
                autoComplete="off"
                data-bwignore="true"
                data-1p-ignore
                data-lpignore="true"
                data-form-type="other"
              />
            </div>

            {/* Privacy Hint */}
            <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-3.5 border border-border/40">
              <IconInfoCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your API key is stored only in your browser's local storage and is never shared with anyone or sent to
                any server except OpenAI's API.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button" disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} type="button" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
