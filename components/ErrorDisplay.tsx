import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  message: string;
  className?: string;
}

export default function ErrorDisplay({ message, className = '' }: ErrorDisplayProps) {
  // Check if the message contains HTML-like content (from our formatted errors)
  const isHtml = /<[a-z][\s\S]*>/i.test(message);
  
  return (
    <div 
      className={`bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            Oops! Something went wrong
          </h3>
          <div 
            className={`mt-1 text-sm text-red-700 dark:text-red-300 ${!isHtml ? 'whitespace-pre-wrap' : ''}`}
            dangerouslySetInnerHTML={isHtml ? { __html: message } : undefined}
          >
            {!isHtml && message}
          </div>
        </div>
      </div>
    </div>
  );
}
