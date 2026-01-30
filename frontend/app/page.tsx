'use client';

import { useRef, useState } from "react";
import { Grid, Card, Textarea, Button, ScrollArea } from "@mantine/core";
import { IconCompass } from "@tabler/icons-react";
import { ActionCard } from "@/components/ActionCard";
import { BrowserInspectorPanel } from "@/components/BrowserInspectorPanel";

export default function Home() {
  const [command, setCommand] = useState("");
  const [actions, setActions] = useState<any[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const runAgent = () => {
    setActions([]);
    setImage(null);

    wsRef.current = new WebSocket("ws://localhost:8000/ws");

    wsRef.current.onopen = () => {
      wsRef.current?.send(command);
    };

    wsRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "status") {
        setIsRunning(msg.state === "running");
      }

      if (msg.type === "action") {
        setActions((prev) => [...prev, msg.data]);
      }

      if (msg.type === "screenshot") {
        setHtml(msg.html);
        setImage(`data:image/png;base64,${msg.image}`);
      }
    };
  };

  return (
    <div className="h-screen bg-zinc-950 text-white flex flex-col">
      {/* Top Navbar */}
      <div className="flex justify-between items-center px-8 py-4 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <IconCompass className="text-blue-500 text-2xl" />
          <span className="text-2xl font-bold">Azimuth</span>
        </div>

        <div className="flex items-center space-x-6">
          <button className="hover:text-blue-400">Login</button>
          <button className="hover:text-blue-400">Settings</button>
          <button className="hover:text-blue-400">Contact</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto min-h-0">
        <Grid>
          {/* Chat Panel */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="md" radius="md" className="bg-zinc-900 border border-zinc-800">
              <h2 className="text-xl font-semibold mb-4">Agent Command</h2>

              <Textarea
                value={command}
                onChange={(e) => setCommand(e.currentTarget.value)}
                placeholder="Type a command for the browser agent"
                minRows={5}
                classNames={{
                  input: "bg-zinc-800 text-white border-zinc-700",
                }}
              />

              <Button
                fullWidth
                mt="md"
                onClick={runAgent}
                className="bg-blue-600 hover:bg-blue-500"
              >
                Run Agent
              </Button>

              {isRunning && (
                <div className="flex items-center space-x-2 text-blue-400 mt-3">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full" />
                  <span className="text-sm">Agent is thinking…</span>
                </div>
              )}

              <h3 className="mt-6 mb-2 text-sm text-zinc-400">Agent Actions</h3>

              <ScrollArea h={300}>
                {actions.map((action, idx) => (
                  <ActionCard key={idx} {...action} index={idx} />
                ))}
              </ScrollArea>
            </Card>
          </Grid.Col>

          {/* Browser View */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <BrowserInspectorPanel
              screenshot={image ?? undefined}
              html={html ?? undefined}
            />
          </Grid.Col>
        </Grid>
      </div>
    </div>
  );
}
