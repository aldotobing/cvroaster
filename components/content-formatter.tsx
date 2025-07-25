import React from 'react';
import { cn } from '@/lib/utils';

type ContentFormatterProps = {
  content: string;
  className?: string;
};

export const ContentFormatter: React.FC<ContentFormatterProps> = ({ content, className }) => {
  if (!content) return null;

  // Split content into paragraphs based on double newlines
  const paragraphs = content.split('\n\n');

  return (
    <div className={cn('whitespace-pre-wrap', className)}>
      {paragraphs.map((paragraph, index) => {
        if (!paragraph.trim()) return <br key={index} />;
        
        // Handle headings
        if (paragraph.startsWith('### ')) {
          return (
            <h3 key={index} className="text-lg font-semibold mt-4 mb-2">
              {paragraph.substring(4)}
            </h3>
          );
        }
        
        if (paragraph.startsWith('## ')) {
          return (
            <h2 key={index} className="text-xl font-bold mt-6 mb-3 border-b pb-1">
              {paragraph.substring(3)}
            </h2>
          );
        }
        
        // Handle lists
        if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
          const items = paragraph.split('\n').filter(Boolean);
          return (
            <ul key={index} className="list-disc pl-6 mb-4 space-y-1">
              {items.map((item, i) => (
                <li key={i}>{item.replace(/^[\-*]\s*/, '')}</li>
              ))}
            </ul>
          );
        }
        
        // Handle regular paragraphs
        return (
          <p key={index} className="mb-4 leading-relaxed">
            {paragraph}
          </p>
        );
      })}
    </div>
  );
};

// Format content for export (RTF/DOCX)
export const formatContentForExport = (content: string): string => {
  if (!content) return '';
  
  // Replace markdown-style headers
  let formatted = content
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>');
  
  // Handle lists
  formatted = formatted.replace(/^[\-*]\s+(.*$)/gm, '<li>$1</li>');
  
  // Replace multiple newlines with paragraph breaks
  formatted = formatted.split('\n\n').map(para => {
    if (!para.trim()) return '';
    return `<p>${para}</p>`;
  }).join('');
  
  // Process paragraphs for additional formatting
  formatted = formatted.replace(/<p>(.*?)<\/p>/g, (match, p1) => {
    // Skip if already wrapped in a heading or list item
    if (p1.startsWith('<h') || p1.startsWith('<li>')) return match;
    return `<p style="margin-bottom: 1em; line-height: 1.6;">${p1}</p>`;
  });
  
  // Handle inline formatting
  formatted = formatted
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  return formatted;
};

// Format content for plain text (useful for copy to clipboard)
export const formatContentForPlainText = (content: string): string => {
  if (!content) return '';
  
  // Remove markdown formatting
  let formatted = content
    .replace(/^#+\s*/gm, '') // Remove headers
    .replace(/\*\*/g, '') // Remove bold
    .replace(/\*/g, '') // Remove italics
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
    .replace(/`([^`]+)`/g, '$1'); // Remove inline code
    
  // Ensure proper spacing
  formatted = formatted
    .replace(/\n{3,}/g, '\n\n') // Max 2 newlines
    .trim();
    
  return formatted;
};
