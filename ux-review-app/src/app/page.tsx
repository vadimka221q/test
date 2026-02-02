'use client';

import { useState, useCallback } from 'react';
import ImageUpload, { ImageFile } from '@/components/ImageUpload';
import ContextForm, { ContextData } from '@/components/ContextForm';
import ReviewReport from '@/components/ReviewReport';
import LoadingSpinner from '@/components/LoadingSpinner';

type AppState = 'idle' | 'loading' | 'success' | 'error';

export default function Home() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [context, setContext] = useState<ContextData>({
    productType: '',
    targetUsers: '',
    primaryGoal: '',
    platform: '',
    constraints: '',
  });
  const [report, setReport] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [appState, setAppState] = useState<AppState>('idle');
  const [isExporting, setIsExporting] = useState(false);

  const canSubmit = images.length > 0 &&
    context.productType.trim() !== '' &&
    context.targetUsers.trim() !== '' &&
    context.primaryGoal.trim() !== '';

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    setAppState('loading');
    setError('');
    setReport('');

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: images.map((img) => ({
            base64: img.base64,
            mediaType: img.mediaType,
          })),
          context,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate review');
      }

      setReport(data.review);
      setAppState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setAppState('error');
    }
  }, [images, context, canSubmit]);

  const handleExportPDF = useCallback(async () => {
    setIsExporting(true);

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('review-report-content');

      if (!element) {
        throw new Error('Report content not found');
      }

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `ux-review-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setImages([]);
    setContext({
      productType: '',
      targetUsers: '',
      primaryGoal: '',
      platform: '',
      constraints: '',
    });
    setReport('');
    setError('');
    setAppState('idle');
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">UX Review</h1>
              <p className="mt-1 text-sm text-gray-500">
                AI-powered design feedback for real products
              </p>
            </div>
            {appState === 'success' && (
              <button
                onClick={handleReset}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Start new review
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {appState === 'loading' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <LoadingSpinner message="Analyzing your designs..." />
          </div>
        ) : appState === 'success' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <ReviewReport
              report={report}
              onExportPDF={handleExportPDF}
              isExporting={isExporting}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upload Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                1. Upload Design Screenshots
              </h2>
              <ImageUpload
                images={images}
                onImagesChange={setImages}
                maxImages={10}
                disabled={appState === 'loading'}
              />
            </section>

            {/* Context Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                2. Provide Product Context
              </h2>
              <ContextForm
                context={context}
                onContextChange={setContext}
                disabled={appState === 'loading'}
              />
            </section>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Error generating review</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || appState === 'loading'}
                className={`
                  px-6 py-3 rounded-lg font-medium text-white
                  transition-all duration-150
                  ${canSubmit
                    ? 'bg-gray-900 hover:bg-gray-800 active:bg-gray-950'
                    : 'bg-gray-300 cursor-not-allowed'
                  }
                `}
              >
                Generate UX Report
              </button>
            </div>

            {/* Requirements hint */}
            {!canSubmit && images.length === 0 && (
              <p className="text-center text-sm text-gray-500">
                Upload at least one screenshot and fill in the required fields to generate a review.
              </p>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Powered by Claude AI. Your designs are not stored permanently.
          </p>
        </div>
      </footer>
    </div>
  );
}
