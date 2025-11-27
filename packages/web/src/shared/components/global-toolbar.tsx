"use client";

import { IconSettings } from "@tabler/icons-react";
import { useState } from "react";

import { Button } from "@/shared/ui";
import { SettingsModal } from "@/shared/components/settings-modal";

export function GlobalToolbar() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-end gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)} type="button">
          <IconSettings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}
