"use client";

import { IconHistory } from "@tabler/icons-react";
import { useState } from "react";

import { Button } from "@/shared/ui";

import { HistoryModal } from "./history-modal";

export function Toolbar() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div className="flex items-center justify-end gap-2 mb-4">
      <Button variant="outline" size="sm" onClick={() => setIsHistoryOpen(true)} type="button">
        <IconHistory className="h-4 w-4 mr-2" />
        History
      </Button>
      <HistoryModal open={isHistoryOpen} onOpenChange={setIsHistoryOpen} />
    </div>
  );
}
