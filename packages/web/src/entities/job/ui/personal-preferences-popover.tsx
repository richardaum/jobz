"use client";

import { Label, Popover, PopoverContent, PopoverTrigger, Textarea } from "@/shared/ui";

interface PersonalPreferencesPopoverProps {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

const DEFAULT_PREFERENCES =
  'I prefer jobs that explicitly accept remote work in Brazil, LATAM, or remote anywhere (just "remote" is not sufficient), international positions, compensation in USD, and senior+ or staff level positions.';

export function PersonalPreferencesPopover({ value, onChange, children }: PersonalPreferencesPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-[600px] max-w-[90vw] max-h-[80vh] flex flex-col overflow-hidden"
        align="start"
        side="bottom"
      >
        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <div>
            <h3 className="font-semibold text-lg mb-1">Personal Preferences</h3>
            <p className="text-sm text-muted-foreground">
              Add your personal job preferences to improve job matching accuracy
            </p>
          </div>
          <div className="space-y-2 flex-1 flex flex-col min-h-0 overflow-hidden">
            <Label htmlFor="personal-preferences-popover">Job Preferences</Label>
            <Textarea
              id="personal-preferences-popover"
              placeholder={DEFAULT_PREFERENCES}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 min-h-[200px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              These preferences will be used when analyzing job matches. Leave empty to use default preferences.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
