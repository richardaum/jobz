"use client";

import { IconSettings } from "@tabler/icons-react";

import { Button } from "@/shared/ui";
import { SettingsModal } from "@/shared/components/settings-modal";
import { useSettingsStore } from "@/shared/stores/settings-store";

export function GlobalToolbar() {
  const isSettingsOpen = useSettingsStore((state) => state.isSettingsOpen);
  const setIsSettingsOpen = useSettingsStore((state) => state.setIsSettingsOpen);

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)} type="button">
          <IconSettings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}
