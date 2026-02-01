'use client';

import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { ResultsDisplay } from '@/components/results-display';
import type { InterpretationResponse } from '@/lib/api-client';

const mockResults: InterpretationResponse = {
  id: 'demo-123',
  document_type: 'Lab Results',
  confidence: 0.92,
  processingTime: 1250,
  interpretation: {
    summary:
      'This lab report shows blood work values that appear within normal ranges. No immediate concerns detected in this summary view.',
    sections: [
      {
        original:
          'WBC 7.2 K/uL, RBC 4.8 M/uL, HGB 14.5 g/dL, HCT 43%, MCV 89 fL',
        simplified:
          'Your white blood cells, red blood cells, hemoglobin, and cell size are all at healthy levels.',
        terms: [
          {
            term: 'WBC (White Blood Cells)',
            definition: 'Cells that help fight infections as part of your immune system.',
            importance: 'high',
          },
          {
            term: 'RBC (Red Blood Cells)',
            definition: 'Cells that carry oxygen throughout your body.',
            importance: 'high',
          },
          {
            term: 'Hemoglobin',
            definition: 'A protein in red blood cells that binds to oxygen.',
            importance: 'medium',
          },
        ],
      },
    ],
    warnings: [
      'Demo content only. Always consult a healthcare professional for medical advice.',
    ],
    nextSteps: [
      'Review results with your healthcare provider.',
      'Ask about any values that are out of range.',
      'Store results for future comparisons.',
    ],
  },
};

export default function ResultsPage() {
  const router = useRouter();

  return (
    <PageShell
      title="Example Results"
      description="A sample interpretation screen showing how results are presented."
    >
      <ResultsDisplay
        results={mockResults}
        onNewDocument={() => router.push('/upload')}
        onAsking={() => undefined}
        isAsking={false}
      />
    </PageShell>
  );
}
