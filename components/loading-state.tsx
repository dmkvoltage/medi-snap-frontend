'use client';

import { Loader2, Zap, Sparkles, FileText, Brain, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function LoadingState() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card className="
        p-8 sm:p-12 
        flex flex-col items-center justify-center gap-6 
        min-h-80 sm:min-h-96 
        rounded-3xl 
        border-0
        bg-gradient-to-br from-background via-primary/5 to-secondary/5
        shadow-[0_20px_60px_rgba(0,0,0,0.1)]
        relative
        overflow-hidden
      ">
        {/* Background animated blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 blur-3xl rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-secondary/10 blur-3xl rounded-full animate-pulse animation-delay-1000" />
        </div>

        {/* Animated badge */}
        <div className="relative z-10 flex items-center gap-3 rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 shadow-lg shadow-primary/10">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm font-semibold text-primary">AI Processing</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-2 w-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '120ms' }} />
            <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '240ms' }} />
          </div>
        </div>

        {/* Animated main loader */}
        <div className="relative z-10">
          <div className="relative">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" />
            {/* Spinning ring */}
            <div className="relative flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-transparent bg-gradient-to-r from-primary via-blue-500 to-secondary shadow-lg">
              <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-primary via-blue-500 to-secondary animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              <div className="relative flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-background">
                <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-primary animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Text content */}
        <div className="relative z-10 text-center space-y-3">
          <h3 className="font-bold text-2xl sm:text-3xl text-foreground flex items-center justify-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Analyzing Your Document
          </h3>
          <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Our AI is reviewing your medical document and preparing a plain language explanation.
          </p>
        </div>

        {/* Animated progress steps */}
        <div className="relative z-10 w-full max-w-sm space-y-4 mt-4">
          {[
            { label: 'Uploading file', icon: FileText, active: true, delay: '0ms' },
            { label: 'Analyzing content', icon: Brain, active: true, delay: '200ms' },
            { label: 'Generating explanation', icon: Lightbulb, active: false, delay: '400ms' },
          ].map((step, index) => (
            <div 
              key={index} 
              className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-muted/50 to-transparent border border-border/50"
              style={{ animationDelay: step.delay }}
            >
              <div className={`
                flex items-center justify-center h-10 w-10 rounded-xl
                ${step.active 
                  ? 'bg-gradient-to-br from-primary/20 to-blue-500/20 shadow-inner' 
                  : 'bg-muted'
                }
              `}>
                {step.active ? (
                  <step.icon className="h-5 w-5 text-primary animate-pulse" />
                ) : (
                  <step.icon className="h-5 w-5 text-muted-foreground/50" />
                )}
              </div>
              <div className="flex-1">
                <span className={`text-sm font-medium ${step.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
                <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      step.active 
                        ? 'bg-gradient-to-r from-primary to-blue-500 animate-pulse' 
                        : 'bg-muted'
                    }`}
                    style={{ width: step.active ? '100%' : '0%' }}
                  />
                </div>
              </div>
              {step.active && (
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              )}
            </div>
          ))}
        </div>

        {/* Estimate with sparkle */}
        <div className="relative z-10 flex items-center gap-2 text-sm font-medium text-primary mt-2 bg-primary/10 px-4 py-2 rounded-full">
          <Zap className="h-4 w-4 animate-pulse" />
          <span>Usually completes in 2-5 seconds</span>
        </div>
      </Card>
    </div>
  );
}
