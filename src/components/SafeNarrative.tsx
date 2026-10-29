/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * UX-15: Safe markdown renderer for clinical narratives.
 * Replaces dangerouslySetInnerHTML with safe React elements.
 * Handles: headings (###), bold (**text**), list items (- item), and paragraphs.
 */

function parseBold(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <React.Fragment key={i}>{part}</React.Fragment>
  );
}

interface SafeNarrativeProps {
  content: string;
  isAr: boolean;
}

export const SafeNarrative: React.FC<SafeNarrativeProps> = ({ content, isAr }) => {
  const paragraphs = content.split('\n\n');

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className={`prose prose-sm max-w-none text-slate-700 leading-relaxed space-y-4 ${
        isAr ? 'font-arabic text-right' : 'text-left'
      }`}
    >
      {paragraphs.map((paragraph, idx) => {
        // Heading detection (## or ###)
        if (paragraph.startsWith('###') || paragraph.startsWith('##')) {
          const headingText = paragraph.replace(/^#+\s*/, '');
          return (
            <h4
              key={idx}
              className="text-sm sm:text-base font-bold text-slate-900 border-s-4 border-emerald-600 ps-3 py-0.5 mt-4 mb-2"
            >
              {parseBold(headingText)}
            </h4>
          );
        }

        // List detection (lines starting with - )
        if (paragraph.includes('\n- ') || paragraph.startsWith('- ')) {
          const items = paragraph.split('\n').filter((l) => l.trim().length > 0);
          return (
            <ul key={idx} className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 ps-1">
              {items.map((item, itemIdx) => (
                <li key={itemIdx} className="leading-relaxed">
                  <span>{parseBold(item.replace(/^-\s*/, ''))}</span>
                </li>
              ))}
            </ul>
          );
        }

        // Numbered list detection (lines starting with digits)
        if (/^\d+\./.test(paragraph.trim())) {
          const items = paragraph.split('\n').filter((l) => l.trim().length > 0);
          return (
            <ol key={idx} className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 ps-1">
              {items.map((item, itemIdx) => (
                <li key={itemIdx} className="leading-relaxed">
                  <span>{parseBold(item.replace(/^\d+\.\s*/, ''))}</span>
                </li>
              ))}
            </ol>
          );
        }

        // Regular paragraph
        return (
          <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {parseBold(paragraph)}
          </p>
        );
      })}
    </div>
  );
};
