import React from "react";
import { Loader2 } from "lucide-react";

const ServerLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-transparent">
      <Loader2 className="w-16 h-16 animate-spin text-indigo-500" />
      <p className="mt-4 text-zinc-400 text-sm font-medium">
        Loading server...
      </p>
      <p className="text-zinc-500 text-xs mt-1">Please wait while we connect</p>
    </div>
  );
};

export default ServerLoading;
