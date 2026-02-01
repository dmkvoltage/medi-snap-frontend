'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { PageShell } from '@/components/page-shell';
import { DocumentUpload } from '@/components/document-upload';
import { Button } from '@/components/ui/button';

export default function UploadPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelected = useCallback((file: File, imagePreview?: string) => {
    setFileName(file.name);
    setPreview(imagePreview || null);
  }, []);

  return (
    <PageShell
      title="Upload a Medical Document"
      description="Add a PDF, JPG, or PNG to start a translation preview."
    >
      <div className="space-y-6">
        <DocumentUpload onFileSelected={handleFileSelected} />

        {(fileName || preview) && (
          <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
            <p className="text-sm font-medium text-foreground">Selected file</p>
            {fileName && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{fileName}</p>
            )}
            {preview && (
              <img
                src={preview}
                alt="Uploaded preview"
                className="mt-4 w-full max-w-sm rounded-xl border border-border"
              />
            )}
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button className="rounded-full" size="sm">
                Start Translation
              </Button>
              <Button variant="outline" className="rounded-full" size="sm" asChild>
                <Link href="/results">View Example Results</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
