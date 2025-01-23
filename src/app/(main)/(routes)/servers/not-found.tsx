"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Shield, Compass, Home, Sparkles } from "lucide-react";

const NotFound = () => {
  return (
    <div className="fixed inset-0 h-full flex items-center justify-center bg-gradient-to-b from-gray-900 via-purple-900 to-violet-900">
      <div className="p-8 max-w-2xl w-full relative">
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.5 + 0.5,
            }}
          />
        ))}

        <div className="relative">
          {/* Animated Server Icon with Effects */}
          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <div className="absolute -inset-4 bg-violet-500 opacity-30 blur-lg rounded-full animate-pulse" />
              <Shield className="w-28 h-28 text-white relative animate-bounce" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Compass className="w-14 h-14 text-violet-300 animate-spin" />
              </div>
              <Sparkles className="absolute -right-4 -top-4 w-6 h-6 text-yellow-300 animate-pulse" />
              <Sparkles className="absolute -left-4 -bottom-4 w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
          </div>

          {/* Glass Card */}
          <div className="mt-20 backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-8 text-center border border-white/20">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-pink-200 mb-6">
              Server Lost in Space
            </h1>

            <p className="text-violet-200 text-lg mb-8">
              This server seems to have drifted into a digital black hole 🌌
            </p>

            <Button
              onClick={() => (window.location.href = "/")}
              className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30 shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Home className="w-5 h-5 mr-2" />
              Return Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
