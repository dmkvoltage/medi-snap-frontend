'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { ResultsDisplay } from '@/components/results-display';
import { LoadingState } from '@/components/loading-state';
import { getInterpretation, askQuestion, InterpretationResponse } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function InterpretationPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const id = params.id as string;

  const [results, setResults] = useState<InterpretationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && id) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const data = await getInterpretation(id);
          setResults(data);
        } catch (err) {
          console.error(err);
          setError('Failed to load interpretation. It may not exist or you do not have permission.');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isAuthenticated, id]);

  const handleAskQuestion = useCallback(
    async (question: string) => {
      if (!results) return;

      setAsking(true);
      try {
        const response = await askQuestion(results.id, question, language);
        return response.answer;
      } catch (err) {
        console.error('Q&A Error:', err);
        // You might want to show a toast here
      } finally {
        setAsking(false);
      }
    },
    [results, language]
  );

  if (authLoading || (loading && !results && !error)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <PageShell title="Error" description="Could not load interpretation" language={language} onLanguageChange={setLanguage}>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
            <button 
                onClick={() => router.push('/dashboard')}
                className="text-sm text-primary hover:underline"
            >
                Return to Dashboard
            </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={results?.document_type || 'Interpretation Results'}
      description={`Analysis from ${results?.created_at ? new Date(results.created_at).toLocaleDateString() : 'recent upload'}`}
      language={language}
      onLanguageChange={setLanguage}
    >
      {results && (
        <ResultsDisplay
          results={results}
          onNewDocument={() => router.push('/')}
          onAsking={handleAskQuestion}
          isAsking={asking}
        />
      )}
    </PageShell>
  );
}
