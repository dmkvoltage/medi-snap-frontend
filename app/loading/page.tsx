'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, ArrowRight, FileText, Brain, MessageCircle, Download } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const workflowSteps = [
  { id: 1, title: 'Document Upload', description: 'Camera or file upload (JPG, PNG, PDF)', icon: FileText },
  { id: 2, title: 'AI Processing', description: 'Document analysis (2-5 seconds)', icon: Brain },
  { id: 3, title: 'View Results', description: '5 tabs: Summary, Details, Terms, Actions, Chat', icon: FileText },
  { id: 4, title: 'Ask Questions', description: 'Optional chat for clarifications', icon: MessageCircle },
  { id: 5, title: 'Save & Export', description: 'Download or save to history', icon: Download },
];

export default function LoadingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Check if we're in processing mode (has file data) or just showing workflow
  const isProcessing = searchParams.get('processing') === 'true';
  const resultId = searchParams.get('resultId');

  useEffect(() => {
    if (isProcessing) {
      // Document processing: show loading animation, then go to workflow
      const timer = setTimeout(() => {
        // Go to workflow page with the result ID
        router.push(`/loading?resultId=${resultId}`);
      }, 3000); // Show document processing for 3 seconds

      return () => clearTimeout(timer);
    } else {
      // Regular workflow display: animate through steps
      const timer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < workflowSteps.length - 1) {
            return prev + 1;
          }
          // Mark as completed
          setIsCompleted(true);
          clearInterval(timer);
          return prev;
        });
      }, 1000);

      // After workflow completes, redirect to results if we have a resultId
      if (isCompleted && resultId) {
        const redirectTimer = setTimeout(() => {
          router.push('/recent');
        }, 2000);
        return () => clearTimeout(redirectTimer);
      }

      return () => clearInterval(timer);
    }
  }, [isProcessing, resultId, router, isCompleted]);

  if (isProcessing) {
    return (
      <PageShell
        title="Processing Your Document"
        description="AI is analyzing your medical document..."
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <LoadingState />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              This usually takes 2-5 seconds...
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="MediSnap Workflow"
      description="Understanding how MediSnap transforms medical documents"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>How MediSnap Works</CardTitle>
            <CardDescription>
              Follow these steps to translate your medical documents into plain language
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {index <= currentStep ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <h3 className={`font-medium ${index <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.title}
                      </h3>
                    </div>
                    <p className={`text-sm ${index <= currentStep ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                      {step.description}
                    </p>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {currentStep >= workflowSteps.length - 1 ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">Ready to get started?</p>
            <div className="flex gap-2 justify-center">
              {isAuthenticated ? (
                <>
                  <Button onClick={() => router.push('/upload')} className="flex-1 max-w-xs">
                    Upload Document
                  </Button>
                  {resultId && (
                    <Button onClick={() => router.push('/recent')} variant="outline" className="flex-1 max-w-xs">
                      View Results
                    </Button>
                  )}
                </>
              ) : (
                <Button onClick={() => router.push('/login')} className="flex-1 max-w-xs">
                  Sign In to Upload
                </Button>
              )}
              <Button onClick={() => router.push('/')} variant="outline" className="flex-1 max-w-xs">
                Back to Home
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Learning the workflow...
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
