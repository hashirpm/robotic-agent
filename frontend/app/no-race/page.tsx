"use client";

import { ArrowRight, Bot, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-accent">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="animate-pulse">
            <Bot size={64} className="text-primary mb-4" />
          </div>
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-chart-1">
            No Live Race
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Come back later to watch AI agent robots compete, stake your tokens,
            and be part of the community.
          </p>
        </div>
      </div>
    </main>
  );
}
