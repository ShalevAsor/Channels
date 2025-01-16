interface FormErrorProps {
  message?: string;
}
export const FormError = ({ message }: FormErrorProps) => {
  return (
    <div className="px-6 text-sm text-rose-500 text-center">
      {message || "Unexpected Error"}
    </div>
  );
};
