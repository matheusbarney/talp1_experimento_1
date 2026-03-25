import { useCallback, useState } from "react";

export function useAppMessages() {
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setFeedback(null);
  }, []);

  return {
    error,
    feedback,
    setError,
    setFeedback,
    clearMessages
  };
}
