'use client';

import React from 'react';

interface ChatMessageContentProps {
  content: string;
  variant?: 'user' | 'bot' | 'admin';
  className?: string;
}

interface InlineToken {
  type: 'text' | 'bold' | 'italic' | 'bold-italic' | 'code' | 'link';
  text: string;
  url?: string;
}

/**
 * Tokenizer untuk parsing inline markdown:
 * - Links: [Text](URL) atau Raw URL https://...
 * - Bold + Italic: ***text***
 * - Bold: **text** atau __text__
 * - Italic: *text* atau _text_
 * - Code: `code`
 */
function parseInlineTokens(line: string): InlineToken[] {
  if (!line) return [];

  // Regex token matching
  const regex = /(\[[^\]]+\]\([^\s)]+\)|https?:\/\/[^\s)]+|\*\*\*[^*]+?\*\*\*|\*\*[^*]+?\*\*|__[^_]+?__|(?<!\*)\*[^*]+?\*(?!\*)|(?<![a-zA-Z0-9])_[^_]+?_(?![a-zA-Z0-9])|`[^`]+`)/g;
  const rawParts = line.split(regex);

  return rawParts.filter(Boolean).map(part => {
    // 1. Bold + Italic (***text***)
    if (part.startsWith('***') && part.endsWith('***') && part.length > 6) {
      return { type: 'bold-italic', text: part.slice(3, -3) };
    }

    // 2. Bold (**text** atau __text__)
    if ((part.startsWith('**') && part.endsWith('**') && part.length > 4) ||
        (part.startsWith('__') && part.endsWith('__') && part.length > 4)) {
      return { type: 'bold', text: part.slice(2, -2) };
    }

    // 3. Italic (*text* atau _text_)
    if ((part.startsWith('*') && part.endsWith('*') && part.length > 2) ||
        (part.startsWith('_') && part.endsWith('_') && part.length > 2)) {
      return { type: 'italic', text: part.slice(1, -1) };
    }

    // 4. Inline Code (`code`)
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return { type: 'code', text: part.slice(1, -1) };
    }

    // 5. Markdown Link [Title](URL)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/);
    if (linkMatch) {
      return { type: 'link', text: linkMatch[1], url: linkMatch[2] };
    }

    // 6. Raw URL (https://...)
    if (/^https?:\/\/[^\s)]+$/.test(part)) {
      return { type: 'link', text: part, url: part };
    }

    // 7. Plain Text
    return { type: 'text', text: part };
  });
}

export default function ChatMessageContent({
  content,
  variant = 'bot',
  className = ''
}: ChatMessageContentProps) {
  if (!content) return null;

  // Gaya warna khusus per varian (User Biru / Bot Amber / Admin Putih)
  const isUser = variant === 'user';
  const isBot = variant === 'bot';

  const boldClass = isUser
    ? 'font-bold text-white'
    : isBot
    ? 'font-bold text-amber-950'
    : 'font-bold text-slate-900';

  const linkClass = isUser
    ? 'underline font-semibold text-blue-100 hover:text-white'
    : isBot
    ? 'underline font-semibold text-amber-900 hover:text-amber-950'
    : 'underline font-semibold text-blue-600 hover:text-blue-800';

  const codeClass = isUser
    ? 'bg-blue-700/60 text-white font-mono text-[11px] px-1 py-0.5 rounded'
    : isBot
    ? 'bg-amber-100 border border-amber-200 text-amber-900 font-mono text-[11px] px-1 py-0.5 rounded'
    : 'bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px] px-1 py-0.5 rounded';

  const renderInline = (line: string) => {
    const tokens = parseInlineTokens(line);
    return tokens.map((token, idx) => {
      switch (token.type) {
        case 'bold':
          return (
            <strong key={idx} className={boldClass}>
              {token.text}
            </strong>
          );
        case 'italic':
          return (
            <em key={idx} className="italic text-inherit">
              {token.text}
            </em>
          );
        case 'bold-italic':
          return (
            <strong key={idx} className={`italic ${boldClass}`}>
              {token.text}
            </strong>
          );
        case 'code':
          return (
            <code key={idx} className={codeClass}>
              {token.text}
            </code>
          );
        case 'link':
          return (
            <a
              key={idx}
              href={token.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline-offset-2 transition-opacity ${linkClass}`}
            >
              {token.text}
            </a>
          );
        default:
          return <React.Fragment key={idx}>{token.text}</React.Fragment>;
      }
    });
  };

  const lines = content.split('\n');

  return (
    <div className={`space-y-1 text-xs leading-relaxed ${className}`}>
      {lines.map((line, lineIdx) => {
        // Baris kosong antar paragraf
        if (!line.trim()) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        // List dengan bullet (• atau -)
        if (line.startsWith('• ') || line.startsWith('- ')) {
          const cleanLine = line.replace(/^[•\-]\s*/, '');
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 my-0.5 pl-0.5">
              <span className={`shrink-0 select-none ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>•</span>
              <span className="flex-1">{renderInline(cleanLine)}</span>
            </div>
          );
        }

        // List bernomor (1. 2. dst)
        const numberedMatch = line.match(/^(\d+\.)\s*(.*)$/);
        if (numberedMatch) {
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 my-0.5 pl-0.5">
              <span className={`shrink-0 select-none font-semibold ${isUser ? 'text-blue-200' : 'text-slate-500'}`}>
                {numberedMatch[1]}
              </span>
              <span className="flex-1">{renderInline(numberedMatch[2])}</span>
            </div>
          );
        }

        // Baris teks biasa
        return (
          <div key={lineIdx} className="leading-relaxed">
            {renderInline(line)}
          </div>
        );
      })}
    </div>
  );
}
