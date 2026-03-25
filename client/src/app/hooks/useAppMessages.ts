import { useCallback, useState } from "react";
import { toast } from "react-toastify";

export function useAppMessages() {
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const showError = useCallback((message: string | null) => {
    setError(message);
    if (message) {
      toast.error(message);
    }
  }, []);

  const showFeedback = useCallback((message: string | null) => {
    setFeedback(message);
    if (message) {
      toast.success(message);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setFeedback(null);
  }, []);

  return {
    error,
    feedback,
    setError: showError,
    setFeedback: showFeedback,
    clearMessages
  };
}
