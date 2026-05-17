import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/toast';

export function useAIGeneration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [streamedContent, setStreamedContent] = useState('');

  const mutation = useMutation({
    mutationFn: async ({ prompt, type, noteId, userId }: { 
      prompt: string; 
      type: string; 
      noteId: string; 
      userId: string; 
    }) => {
      setStreamedContent(''); // Reset before new generation

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type, noteId, userId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'An unexpected error occurred while generating AI content.');
      }

      if (!response.body) {
        throw new Error('No response body returned from API.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let finalContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        finalContent += chunk;
        setStreamedContent((prev) => prev + chunk);
      }

      return finalContent;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ai-history', variables.noteId] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'AI generation failed',
        description: error.message,
        status: 'error',
        duration: 4000,
      });
    },
  });

  return {
    ...mutation,
    streamedContent,
  };
}
