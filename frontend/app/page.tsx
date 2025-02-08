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
            Robotic Agent Race Arena
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Welcome to the future of robotic racing. Watch AI agent robots compete, stake your tokens, and be part of the community.
          </p>
          <div className="flex gap-4 mt-8">
            <Link
              href="/races"
              className="group flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full hover:opacity-90 transition-all"
            >
              View Ongoing Staking
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/live"
              className="group flex items-center gap-2 bg-destructive text-destructive-foreground px-6 py-3 rounded-full hover:opacity-90 transition-all"
            >
              Live Races
              <Zap className="group-hover:scale-110 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}