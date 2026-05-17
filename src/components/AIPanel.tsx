// src/components/AIPanel.tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function AIPanel({ noteId, userId }) {
  const queryClient = useQueryClient();
  const [streamedContent, setStreamedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const aiMutation = useMutation({
    mutationFn: async ({ prompt, type }: { prompt: string; type: string }) => {
      setIsStreaming(true);
      setStreamedContent(''); // Reset on new generation

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type, noteId, userId }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Network response was not ok');
      }

      // Read the stream chunk by chunk
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let finalContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        finalContent += chunk;
        
        // Update local state for real-time UI
        setStreamedContent((prev) => prev + chunk);
      }

      return finalContent;
    },
    onSuccess: () => {
      // Invalidate existing AI history so React Query refetches the newly saved DB record
      queryClient.invalidateQueries({ queryKey: ['ai-history', noteId] });
    },
    onSettled: () => {
      setIsStreaming(false);
    },
  });

  const handleGenerateSummary = () => {
    aiMutation.mutate({ prompt: 'Summarize this note.', type: 'summary' });
  };

  return (
    <div className="p-4 bg-purple-50 rounded-xl shadow-sm border border-purple-100">
      <button 
        onClick={handleGenerateSummary}
        disabled={isStreaming}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
      >
        {isStreaming ? 'Generating...' : 'Generate Summary'}
      </button>

      {/* Render streamed content if active, otherwise fallback to React Query data */}
      {(streamedContent || isStreaming) && (
        <div className="mt-4 p-3 bg-white rounded border border-purple-200 min-h-[100px]">
          <p className="text-gray-800 whitespace-pre-wrap">{streamedContent}</p>
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-purple-500 animate-pulse" />
          )}
        </div>
      )}
    </div>
  );
}
