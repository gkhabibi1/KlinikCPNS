'use client';

import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface FormattedTextProps {
  text?: string | null;
  className?: string;
  inline?: boolean;
}

export function renderFormattedContent(text?: string | null): string {
  if (!text) return '';

  let processed = String(text);

  try {
    // 1. Process Display Math: $$...$$ or \[...\]
    processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      } catch (e) {
        return math;
      }
    });

    processed = processed.replace(/\\\[([\s\S]+?)\\\]/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      } catch (e) {
        return math;
      }
    });

    // 2. Process Inline Math: \(...\) and $...$
    processed = processed.replace(/\\\(([\s\S]+?)\\\)/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      } catch (e) {
        return math;
      }
    });

    processed = processed.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      } catch (e) {
        return match;
      }
    });

    // 3. Konversi \n ke <br /> jika belum ada tag blok HTML
    if (!/<(p|div|br|ul|ol|li|table|tr|td|th)\b[^>]*>/i.test(processed)) {
      processed = processed.replace(/\n/g, '<br />');
    }

  } catch (err) {
    console.error('Error rendering LaTeX/HTML:', err);
  }

  return processed;
}

export default function FormattedText({ text, className = '', inline = true }: FormattedTextProps) {
  if (!text) return null;

  const htmlContent = renderFormattedContent(text);
  const Tag = inline ? 'span' : 'div';

  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
