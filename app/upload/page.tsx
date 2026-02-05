'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { DocumentUpload } from '@/components/document-upload';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, RefreshCw, FileText, Camera, Upload, UserPlus, LogIn } from 'lucide-react';
import { interpretDocument, validateFile, InterpretationResponse } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('en');
  const [showSignupDialog, setShowSignupDialog] = useState(false);

  // Redirect unregistered users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Don't auto-show dialog, let them see the page first
    }
  }, [authLoading, isAuthenticated]);

  const handleFileSelected = useCallback((file: File, imagePreview?: string) => {
    // Check if user is authenticated before allowing file selection
    if (!isAuthenticated) {
      setShowSignupDialog(true);
      return;
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
    if (imagePreview) {
      setPreview(imagePreview);
    }
    setError(null);
  }, [isAuthenticated]);

  const handleInterpret = useCallback(async () => {
    if (!isAuthenticated) {
      setShowSignupDialog(true);
      return;
    }

    if (!selectedFile) {
      setError('Please select a document first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Start the interpretation process
      const response = await interpretDocument(selectedFile, language);
      
      // Navigate to loading page first, then it will go to workflow, then results
      router.push(`/loading?processing=true&resultId=${response.id}`);
    } catch (err) {
      console.error('Interpretation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to interpret document. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  }, [selectedFile, language, router, isAuthenticated]);

  if (loading) {
    return (
      <PageShell
        title="Processing Your Document"
        description="AI is analyzing your medical document..."
        language={language}
        onLanguageChange={setLanguage}
      >
        <LoadingState />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Upload Medical Document"
      description="Upload your medical document to get a plain language translation"
      language={language}
      onLanguageChange={setLanguage}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Authentication Check */}
        {!authLoading && !isAuthenticated && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Sign in required:</strong> You need to create an account to upload and analyze medical documents.
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => router.push('/register')}>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Sign Up
                </Button>
                <Button size="sm" variant="outline" onClick={() => router.push('/login')}>
                  <LogIn className="h-4 w-4 mr-1" />
                  Sign In
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* How it works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              How It Works
            </CardTitle>
            <CardDescription>
              Simple 3-step process to understand your medical documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">1. Upload</h3>
                <p className="text-sm text-muted-foreground">
                  Camera or file upload (JPG, PNG, PDF)
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <RefreshCw className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">2. Process</h3>
                <p className="text-sm text-muted-foreground">
                  AI analyzes in 2-5 seconds
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">3. Understand</h3>
                <p className="text-sm text-muted-foreground">
                  Get plain language results
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Section */}
        {isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Document</CardTitle>
              <CardDescription>
                Supported formats: JPG, PNG, PDF (max 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DocumentUpload
                onFileSelected={handleFileSelected}
                isLoading={loading}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {selectedFile && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleInterpret}
                    disabled={loading}
                    size="lg"
                    className="w-full"
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
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Privacy Notice */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Privacy First:</strong> Your documents are processed securely and never stored. 
            Results are automatically deleted when you close the browser.
          </AlertDescription>
        </Alert>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/')}>
            Back to Home
          </Button>
          {isAuthenticated && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/recent')}>
                Recent Results
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                View History
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Signup Dialog */}
      <Dialog open={showSignupDialog} onOpenChange={setShowSignupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Sign In Required
            </DialogTitle>
            <DialogDescription>
              You need to create an account or sign in to upload and analyze medical documents.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => router.push('/register')} className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </Button>
              <Button variant="outline" onClick={() => router.push('/login')} className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </div>
            <div className="text-center">
              <Button variant="ghost" onClick={() => router.push('/')} className="text-sm">
                Back to Home
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
