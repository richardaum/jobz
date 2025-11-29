"use client";

import { IconUpload } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/ui";

import { extractTextFromPDF } from "../lib/pdf-extractor";

interface PdfImportButtonProps {
  onImport: (text: string) => void;
}

export function PdfImportButton({ onImport }: PdfImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      return;
    }

    setIsLoading(true);
    try {
      const text = await extractTextFromPDF(file);
      onImport(text);
      toast.success("PDF imported successfully");
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      toast.error("Error extracting text from PDF. Please try again.");
    } finally {
      setIsLoading(false);
      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
        id="pdf-upload"
      />
      <Button
        variant="outline"
        size="sm"
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="text-xs"
      >
        <IconUpload className="h-3 w-3 mr-1" />
        {isLoading ? "Loading..." : "Import PDF"}
      </Button>
    </>
  );
}
