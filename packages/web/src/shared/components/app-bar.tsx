"use client";

import { IconSettings } from "@tabler/icons-react";

import { Button } from "@/shared/ui";
import { SettingsModal } from "@/shared/components/settings-modal";
import { useSettingsStore } from "@/shared/stores/settings-store";

export function AppBar() {
  const isSettingsOpen = useSettingsStore((state) => state.isSettingsOpen);
  const setIsSettingsOpen = useSettingsStore((state) => state.setIsSettingsOpen);

  return (
    <>
      <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <h1 className="text-xl sm:text-2xl font-bold">Jobz</h1>
          <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)} type="button">
            <IconSettings className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </div>
      </header>
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}

