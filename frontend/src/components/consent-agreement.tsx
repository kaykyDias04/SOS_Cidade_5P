"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Checkbox } from "@/src/components/ui/checkbox";
import { LEGAL_DOCUMENTS, LEGAL_DOCUMENT_VERSION } from "@/src/lib/legalDocuments";

type DocumentName = keyof typeof LEGAL_DOCUMENTS;

interface ConsentAgreementProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export function ConsentAgreement({ checked, onChange, error }: ConsentAgreementProps) {
  const [document, setDocument] = useState<DocumentName | null>(null);
  const content = document ? LEGAL_DOCUMENTS[document] : null;

  return (
    <>
      <div>
        <div className="flex items-start gap-3">
          <Checkbox
            checked={checked}
            onCheckedChange={(value) => onChange(value === true)}
            aria-label="Li e concordo com os Termos de Uso e a Política de Privacidade"
            className="mt-1"
          />
          <p className="text-sm leading-5 text-stone-700">
            Li e concordo com os{" "}
            <button type="button" className="font-semibold text-sky-700 underline" onClick={() => setDocument("terms")}>
              Termos de Uso
            </button>
            {" "}e a{" "}
            <button type="button" className="font-semibold text-sky-700 underline" onClick={() => setDocument("privacy")}>
              Política de Privacidade
            </button>
            .
          </p>
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>

      <Dialog open={document !== null} onOpenChange={(open) => !open && setDocument(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{content?.title}</DialogTitle>
            <DialogDescription>Versão {LEGAL_DOCUMENT_VERSION} · Protótipo acadêmico</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {content?.sections.map((section) => (
              <section key={section.heading}>
                <h3 className="font-semibold">{section.heading}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{section.body}</p>
              </section>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
