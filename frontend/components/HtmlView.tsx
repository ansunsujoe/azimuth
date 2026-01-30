'use client';
import { ScrollArea } from '@mantine/core';

interface HtmlViewProps {
  html?: string;
}

const HtmlView = ({ html }: HtmlViewProps) => {
  if (!html) {
    return <div className="text-zinc-500 text-sm">No HTML captured</div>;
  }

  // Step 1: Escape dangerous characters (just in case)
  let safeHtml = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Step 2: Regex-based highlighting
  safeHtml = safeHtml
    // highlight opening and closing tags
    .replace(/(&lt;(\/)?[a-zA-Z0-9\-]+(&gt;)?)/g, '<span class="text-blue-400">$1</span>')
    // // highlight attribute names
    // .replace(/([a-zA-Z\-]+)=/g, '<span class="text-yellow-300">$1</span>=')
    // // highlight attribute strings
    // .replace(/="([^"]*)"/g, '="<span class="text-green-400">$1</span>"');

  return (
    <ScrollArea h="500">
      <pre className="bg-zinc-900 text-zinc-100 p-3 rounded-md overflow-auto font-mono text-xs whitespace-pre-wrap break-all">
        <code dangerouslySetInnerHTML={{ __html: safeHtml }} />
      </pre>
    </ScrollArea>
  );
};

export default HtmlView;