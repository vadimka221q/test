'use client';

import { useMemo, useCallback } from 'react';

interface ReviewReportProps {
  report: string;
  onExportPDF: () => void;
  isExporting?: boolean;
}

export default function ReviewReport({ report, onExportPDF, isExporting = false }: ReviewReportProps) {
  const parsedSections = useMemo(() => {
    const sections: { title: string; content: string }[] = [];
    const lines = report.split('\n');
    let currentSection: { title: string; content: string } | null = null;

    for (const line of lines) {
      const headerMatch = line.match(/^##\s+(.+)$/);
      if (headerMatch) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = { title: headerMatch[1], content: '' };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }, [report]);

  const renderMarkdown = useCallback((text: string) => {
    let html = text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br />');

    html = html.replace(/(<li[^>]*>.*<\/li>\s*)+/g, (match) => {
      const hasDecimal = match.includes('list-decimal');
      const tag = hasDecimal ? 'ol' : 'ul';
      return `<${tag} class="mb-3 list-disc">${match}</${tag}>`;
    });

    return `<p class="mb-3">${html}</p>`;
  }, []);

  const getSectionIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('context')) return '📋';
    if (lower.includes('critical')) return '🚨';
    if (lower.includes('hierarchy') || lower.includes('layout')) return '📐';
    if (lower.includes('accessibility')) return '♿';
    if (lower.includes('conversion') || lower.includes('product')) return '📊';
    if (lower.includes('recommendation')) return '💡';
    if (lower.includes('priority')) return '🎯';
    return '📝';
  };

  const getSectionColor = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('critical')) return 'border-l-red-500 bg-red-50';
    if (lower.includes('accessibility')) return 'border-l-orange-500 bg-orange-50';
    if (lower.includes('conversion') || lower.includes('product')) return 'border-l-yellow-500 bg-yellow-50';
    if (lower.includes('recommendation')) return 'border-l-green-500 bg-green-50';
    if (lower.includes('priority')) return 'border-l-blue-500 bg-blue-50';
    return 'border-l-gray-500 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">UX Review Report</h2>
        <button
          onClick={onExportPDF}
          disabled={isExporting}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700
                     bg-white border border-gray-300 rounded-lg hover:bg-gray-50
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
        >
          {isExporting ? (
            <>
              <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </>
          )}
        </button>
      </div>

      <div id="review-report-content" className="space-y-4">
        {parsedSections.length > 0 ? (
          parsedSections.map((section, index) => (
            <div
              key={index}
              className={`border-l-4 rounded-r-lg p-4 ${getSectionColor(section.title)}`}
            >
              <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                <span className="mr-2">{getSectionIcon(section.title)}</span>
                {section.title}
              </h3>
              <div
                className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(section.content.trim()) }}
              />
            </div>
          ))
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div
              className="text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(report) }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
