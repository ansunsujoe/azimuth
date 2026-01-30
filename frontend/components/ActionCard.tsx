'use client';

import { Card, Badge } from '@mantine/core';
import { IconMouse, IconWorld, IconKeyboard, IconCheck } from '@tabler/icons-react';

export type AgentActionType = 'goto' | 'click' | 'fill' | 'done';

interface ActionCardProps {
  action: AgentActionType;
  url?: string;
  selector?: string;
  text?: string;
  index?: number;
}

const ACTION_META: Record<
  AgentActionType,
  { label: string; color: string; icon: React.ReactNode }
> = {
  goto: {
    label: 'Navigate',
    color: 'blue',
    icon: <IconWorld size={18} />,
  },
  click: {
    label: 'Click',
    color: 'grape',
    icon: <IconMouse size={18} />,
  },
  fill: {
    label: 'Fill',
    color: 'teal',
    icon: <IconKeyboard size={18} />,
  },
  done: {
    label: 'Done',
    color: 'green',
    icon: <IconCheck size={18} />,
  },
};

export const ActionCard = ({
  action,
  url,
  selector,
  text,
  index,
}: ActionCardProps) => {
  console.log(url);
  const meta = ACTION_META[action];

  return (
    <Card
      withBorder
      radius="md"
      className="bg-zinc-900 border-zinc-800 text-white mb-3"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {meta.icon}
          <span className="font-semibold">{meta.label}</span>
        </div>

        <Badge color={meta.color} variant="light">
          {action.toUpperCase()}
        </Badge>
      </div>

      {index !== undefined && (
        <div className="text-xs text-zinc-400 mb-2">
          Step {index + 1}
        </div>
      )}

      <div className="space-y-1 text-sm text-zinc-300">
        {url && (
          <div>
            <span className="text-zinc-500">URL:</span>{' '}
            <span className="break-all">{url}</span>
          </div>
        )}

        {selector && (
          <div>
            <span className="text-zinc-500">Selector:</span>{' '}
            <code className="text-amber-300">{selector}</code>
          </div>
        )}

        {text && (
          <div>
            <span className="text-zinc-500">Text:</span>{' '}
            <span className="italic">"{text}"</span>
          </div>
        )}
      </div>
    </Card>
  );
};
