'use client';

import { Loader2, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function LoadingState() {
  return (
    <div className="space-y-4">
      <Card className="p-8 sm:p-12 flex flex-col items-center justify-center gap-6 min-h-80 sm:min-h-96 rounded-3xl border-border bg-background shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3 rounded-full border border-border/70 bg-muted/40 px-4 py-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-2 w-2 rounded-full bg-destructive animate-bounce" style={{ animationDelay: '120ms' }} />
            <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '240ms' }} />
            <span className="h-2 w-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '360ms' }} />
          </div>
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">Analyzing…</span>
        </div>

        <div className="rounded-2xl bg-primary/10 p-4 sm:p-5">
          <Loader2 className="h-8 sm:h-10 w-8 sm:w-10 animate-spin text-primary" aria-hidden="true" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="font-semibold text-foreground text-lg sm:text-xl">
            Analyzing Your Document
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-sm">
            Our AI is reviewing your medical document and preparing a plain language explanation.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="w-full max-w-xs space-y-3 mt-4">
          {[
            { label: 'Uploading file', active: true },
            { label: 'Analyzing content', active: true },
            { label: 'Generating explanation', active: false },
          ].map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                {step.active ? (
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-muted" aria-hidden="true" />
                )}
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">{step.label}</span>
            </div>
          ))}
        </div>

        {/* Estimate */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-primary mt-2">
          <Zap className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          <span>Usually completes in 2-5 seconds</span>
        </div>
      </Card>
    </div>
  );
}
