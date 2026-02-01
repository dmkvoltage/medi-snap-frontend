'use client';


import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { PageNav } from '@/components/page-nav';
import { DocumentUpload } from '@/components/document-upload';
import { ResultsDisplay } from '@/components/results-display';
import { LandingSection } from '@/components/landing-section';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  interpretDocument,
  askQuestion,
  InterpretationResponse,
} from '@/lib/api-client';

export default function Home() {
  const [results, setResults] = useState<InterpretationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [language, setLanguage] = useState('en');
  const [showUpload, setShowUpload] = useState(false);
  const abortControllerRef = useCallback(() => new AbortController(), []);

  // Clear data on page unload (privacy first)
  useEffect(() => {
    const handleBeforeUnload = () => {
      setResults(null);
      setSelectedFile(null);
      setPreview(null);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleFileSelected = useCallback(
    (file: File, imagePreview?: string) => {
      setSelectedFile(file);
      if (imagePreview) {
        setPreview(imagePreview);
      }
      setError(null);
    },
    []
  );

  const handleInterpret = useCallback(async () => {
    if (!selectedFile) {
      setError('Please select a document first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const controller = abortControllerRef();
      const response = await interpretDocument(selectedFile, controller.signal);
      setResults(response);

      // Mock data if API is not available
      if (!response.id) {
        const mockResponse: InterpretationResponse = {
          id: 'mock-' + Date.now(),
          document_type: 'Lab Results',
          confidence: 0.92,
          processingTime: 1250,
          interpretation: {
            summary:
              'This is a lab report showing blood work results. All values appear to be within normal ranges. No immediate medical concerns detected.',
            sections: [
              {
                original:
                  'WBC 7.2 K/uL, RBC 4.8 M/uL, HGB 14.5 g/dL, HCT 43%, MCV 89 fL',
                simplified:
                  'Your white blood cells (which fight infection), red blood cells (which carry oxygen), and hemoglobin (oxygen-carrying protein) are all at healthy levels.',
                terms: [
                  {
                    term: 'WBC (White Blood Cells)',
                    definition:
                      'Cells that fight infections and are part of your immune system',
                    importance: 'high',
                  },
                  {
                    term: 'RBC (Red Blood Cells)',
                    definition:
                      'Cells that carry oxygen throughout your body',
                    importance: 'high',
                  },
                  {
                    term: 'Hemoglobin',
                    definition:
                      'A protein in red blood cells that binds to oxygen',
                    importance: 'medium',
                  },
                ],
              },
            ],
            warnings: [
              'This is a mock interpretation for demonstration. Always consult your doctor for actual medical advice.',
            ],
            nextSteps: [
              'Review results with your healthcare provider',
              'Schedule a follow-up if recommended by your doctor',
              'Keep records of your lab results for future reference',
            ],
          },
        };
        setResults(mockResponse);
      }
    } catch (err) {
      console.error('[v0] Error:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to interpret document. Please try again.';
      setError(errorMessage);

      // Try mock data if API fails
      const mockResponse: InterpretationResponse = {
        id: 'mock-' + Date.now(),
        document_type: 'Medical Document',
        confidence: 0.85,
        processingTime: 1250,
        interpretation: {
          summary:
            'This medical document has been analyzed. Due to a temporary connection issue, showing mock data for demonstration purposes.',
          sections: [
            {
              original: '[Document content would appear here]',
              simplified:
                'This is where the plain language explanation of your document would be displayed.',
              terms: [
                {
                  term: 'Example Medical Term',
                  definition: 'An explanation of what this term means in simple words',
                  importance: 'medium',
                },
              ],
            },
          ],
          warnings: [
            'Demo Mode: Using mock data. Connect to backend for real interpretations.',
          ],
          nextSteps: ['Set up your backend API', 'Configure environment variables'],
        },
      };
      setResults(mockResponse);
    } finally {
      setLoading(false);
    }
  }, [selectedFile, abortControllerRef]);

  const handleAskQuestion = useCallback(
    async (question: string) => {
      if (!results) return;

      setAsking(true);

      try {
        const response = await askQuestion(results.id, question);
        console.log('[v0] Q&A Response:', response);
        // Response handling would be implemented based on your backend
      } catch (err) {
        console.error('[v0] Q&A Error:', err);
      } finally {
        setAsking(false);
      }
    },
    [results]
  );

  const handleReset = useCallback(() => {
    setResults(null);
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  }, []);

  const handleNewDocument = useCallback(() => {
    setResults(null);
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header language={language} onLanguageChange={setLanguage} />
      <PageNav className="mt-2" />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        
        {!results && !selectedFile && !showUpload && (
          <LandingSection onGetStarted={() => setShowUpload(true)} />
        )}

        {(!results && !selectedFile && showUpload) && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Upload Your Medical Document
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Language: <span className="font-medium">{language.toUpperCase()}</span>
              </p>
            </div>
            <Button
              onClick={() => setShowUpload(false)}
              variant="outline"
              className="mb-4"
            >
              Back to Home
            </Button>
          </div>
        )}

        {(selectedFile || loading || results || showUpload) && (
          <div className="space-y-6">
            {/* Upload Section */}
            {!loading && !results && showUpload && (
              <div>
                <DocumentUpload
                  onFileSelected={handleFileSelected}
                  isLoading={loading}
                />

                {error && (
                  <Alert variant="destructive" className="rounded-xl border-destructive/50 bg-destructive/5 mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-destructive dark:text-red-400">{error}</AlertDescription>
                  </Alert>
                )}

                {selectedFile && !results && (
                  <Button
                    onClick={handleInterpret}
                    disabled={!selectedFile || loading}
                    size="lg"
                    className="w-full rounded-full h-12 font-semibold text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm mt-4"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Translate Document'
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* Upload from results section */}
            {!loading && !results && !showUpload && selectedFile && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                    Medical Document Translator
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Language: <span className="font-medium">{language.toUpperCase()}</span>
                  </p>
                </div>

                <DocumentUpload
                  onFileSelected={handleFileSelected}
                  isLoading={loading}
                />

                {error && (
                  <Alert variant="destructive" className="rounded-xl border-destructive/50 bg-destructive/5 mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-destructive dark:text-red-400">{error}</AlertDescription>
                  </Alert>
                )}

                {selectedFile && !results && (
                  <Button
                    onClick={handleInterpret}
                    disabled={!selectedFile || loading}
                    size="lg"
                    className="w-full rounded-full h-12 font-semibold text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm mt-4"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Translate Document'
                    )}
                  </Button>
                )}
              </div>
            )}

            {loading && <LoadingState />}

            {/* Results Section */}
            {results && (
              <div className="space-y-6">
                <ResultsDisplay
                  results={results}
                  onNewDocument={handleNewDocument}
                  onAsking={handleAskQuestion}
                  isAsking={asking}
                />

                {/* Upload Another Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Analyze Another Document
                  </h3>
                  <DocumentUpload
                    onFileSelected={handleFileSelected}
                    isLoading={loading}
                    showCompact={true}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
