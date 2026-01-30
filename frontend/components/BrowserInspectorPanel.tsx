'use client';

import { useState } from 'react';
import { Button, Group } from '@mantine/core';
import BrowserView from './BrowserView';
import HtmlView from './HtmlView';

interface BrowserInspectorPanelProps {
  screenshot?: string; // base64 png
  html?: string;
}

export const BrowserInspectorPanel = ({
  screenshot,
  html,
}: BrowserInspectorPanelProps) => {
  const [mode, setMode] = useState<'browser' | 'html'>('browser');

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Toggle bar */}
      <div className="p-3 border-b border-zinc-800">
        <Group gap="xs">
          <Button
            size="xs"
            className="text-blue-400"
            variant={mode === 'browser' ? 'filled' : 'light'}
            onClick={() => setMode('browser')}
          >
            Browser
          </Button>
          <Button
            size="xs"
            className="text-blue-400"
            variant={mode === 'html' ? 'filled' : 'light'}
            onClick={() => setMode('html')}
          >
            HTML
          </Button>
        </Group>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3">
        {mode === 'browser' && <BrowserView screenshot={screenshot} />}
        {mode === 'html' && <HtmlView html={html} />}
      </div>
    </div>
  );
};
