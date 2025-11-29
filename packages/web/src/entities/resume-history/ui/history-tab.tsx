"use client";

import { IconClock, IconTrash, IconX } from "@tabler/icons-react";
import { format } from "date-fns";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui";

import type { ResumeHistoryItem } from "../types";

interface HistoryTabProps {
  history: ResumeHistoryItem[];
  onLoadItem: (item: ResumeHistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
}

export function HistoryTab({ history, onLoadItem, onDeleteItem, onClearHistory }: HistoryTabProps) {
  if (history.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconClock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">Nenhum histórico de processamento ainda.</p>
            <p className="text-muted-foreground text-sm text-center mt-2">
              Processe um resume para começar a construir seu histórico.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Histórico de Processamentos</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {history.length} {history.length === 1 ? "item" : "itens"} no histórico
          </p>
        </div>
        <Button variant="outline" onClick={onClearHistory} type="button">
          <IconX className="h-4 w-4 mr-2" />
          Limpar Histórico
        </Button>
      </div>

      <div className="grid gap-3">
        {history.map((item) => {
          const date = new Date(item.timestamp);
          const matchPercentage = item.matchResult?.matchPercentage ?? 0;

          return (
            <Card
              key={item.id}
              className="hover:shadow-md hover:bg-accent/50 hover:border-primary/20 transition-all cursor-pointer group active:scale-[0.98]"
              onClick={() => onLoadItem(item)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors">
                      {format(date, "dd/MM/yyyy 'às' HH:mm")}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">Match: {matchPercentage}%</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    className="shrink-0 ml-2 h-6 w-6 p-0"
                    type="button"
                  >
                    <IconTrash className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground line-clamp-2">{item.jobDescription.substring(0, 150)}...</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
