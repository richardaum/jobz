"use client";

import { IconClock, IconTrash, IconX } from "@tabler/icons-react";
import { format } from "date-fns";

import { Button } from "@/shared/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui";

import type { ResumeHistoryItem } from "../stores/resume-store";

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

      <div className="grid gap-4">
        {history.map((item) => {
          const date = new Date(item.timestamp);
          const matchPercentage = item.matchResult?.matchPercentage ?? 0;

          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      Processamento - {format(date, "dd/MM/yyyy 'às' HH:mm")}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Match: {matchPercentage}% • {format(date, "dd/MM/yyyy")}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteItem(item.id)}
                    className="shrink-0 ml-2"
                    type="button"
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Job Description (preview)</p>
                    <p className="text-sm line-clamp-2">{item.jobDescription.substring(0, 150)}...</p>
                  </div>
                  <Button
                    variant="default"
                    onClick={() => onLoadItem(item)}
                    className="w-full"
                    type="button"
                  >
                    Carregar este processamento
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

