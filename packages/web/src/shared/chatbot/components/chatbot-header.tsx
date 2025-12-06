"use client";

import { IconArrowsMaximize, IconArrowsMinimize, IconX } from "@tabler/icons-react";

import { Button, DialogClose } from "@/shared/ui";

import type { ChatbotHeaderConfig } from "../types";

interface ChatbotHeaderProps {
  config: ChatbotHeaderConfig;
  isModal: boolean;
  onToggleModal: () => void;
  onClose: () => void;
}

export function ChatbotHeader({ config, isModal, onToggleModal, onClose }: ChatbotHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
      <div className="flex items-center gap-2">
        {config.icon ? (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">{config.icon}</div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg">💬</span>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-sm">{config.title}</h3>
          {config.description && <p className="text-xs text-muted-foreground">{config.description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleModal}
          type="button"
          className="h-8 w-8 p-0"
          title={isModal ? "Switch to floating mode" : "Switch to modal mode"}
        >
          {isModal ? <IconArrowsMinimize className="h-4 w-4" /> : <IconArrowsMaximize className="h-4 w-4" />}
        </Button>
        {isModal ? (
          <DialogClose asChild>
            <Button variant="ghost" size="sm" type="button" className="h-8 w-8 p-0">
              <IconX className="h-4 w-4" />
            </Button>
          </DialogClose>
        ) : (
          <Button variant="ghost" size="sm" onClick={onClose} type="button" className="h-8 w-8 p-0">
            <IconX className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
