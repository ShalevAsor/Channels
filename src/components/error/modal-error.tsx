import { AlertCircle } from "lucide-react";

interface ModalErrorProps {
  message?: string;
  className?: string;
}

export const ModalError = ({ message, className = "" }: ModalErrorProps) => {
  if (!message) return null;

  return (
    <div className="flex justify-center">
      <div
        className={`
          inline-flex
          items-center
          gap-x-3
          p-4
          rounded-md
          bg-rose-500/10
          border
          border-rose-500/20
          text-rose-500
          ${className}
        `}
      >
        <AlertCircle className="h-5 w-5" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};
