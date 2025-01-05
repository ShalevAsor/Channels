import { Loader2 } from "lucide-react";

export const LoadingSpinner = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-zinc-500" />
    </div>
  );
};
