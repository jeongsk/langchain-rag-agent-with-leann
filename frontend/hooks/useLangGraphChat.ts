import { useState, useCallback, useRef, useEffect } from "react";
import { Client } from "@langchain/langgraph-sdk";

interface UseLangGraphChatOptions {
  assistantId?: string;
  onError?: (error: Error) => void;
}

export function useLangGraphChat(options: UseLangGraphChatOptions = {}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const threadIdRef = useRef<string | undefined>();
  const clientRef = useRef<Client | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize LangGraph Client with rewritten URL
  useEffect(() => {
    clientRef.current = new Client({ 
      apiUrl: process.env.LANGGRAPH_API_URL || "http://localhost:8123",
    });
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() || isLoading || !clientRef.current) return;

      const userMessage = {
        id: Date.now().toString(),
        role: "user",
        content: input,
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setIsLoading(true);

      try {
        abortControllerRef.current = new AbortController();
        const client = clientRef.current;
        const assistantId = options.assistantId || "agent";

        // Create thread if it doesn't exist
        if (!threadIdRef.current) {
          const thread = await client.threads.create();
          threadIdRef.current = thread.thread_id;
        }

        // Convert messages to LangGraph format
        const langGraphMessages = newMessages.map((msg) => ({
          type: msg.role === "user" ? "human" : "ai",
          content: msg.content,
        }));

        let assistantMessage = "";
        const assistantMessageId = (Date.now() + 1).toString();

        // Stream the response
        const streamResponse = client.runs.stream(
          threadIdRef.current,
          assistantId,
          {
            input: { messages: langGraphMessages },
            streamMode: "messages",
          }
        );

        for await (const chunk of streamResponse) {
          // Check if aborted
          if (abortControllerRef.current?.signal.aborted) {
            break;
          }

          // Handle message chunks
          if (chunk.event === "messages/partial" || chunk.event === "messages/complete") {
            const messageData = Array.isArray(chunk.data) ? chunk.data[0] : chunk.data;

            if (messageData?.content) {
              if (Array.isArray(messageData.content)) {
                // Handle array of content blocks
                assistantMessage = messageData.content
                  .map((block: any) => {
                    if (typeof block === "string") return block;
                    if (block.type === "text") return block.text;
                    return JSON.stringify(block);
                  })
                  .join("");
              } else if (typeof messageData.content === "string") {
                assistantMessage = messageData.content;
              } else {
                assistantMessage = JSON.stringify(messageData.content);
              }

              // Update messages with streaming content
              setMessages([
                ...newMessages,
                {
                  id: assistantMessageId,
                  role: "assistant",
                  content: assistantMessage,
                },
              ]);
            }
          }
        }

        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            console.log("Request aborted");
          } else if (options.onError) {
            options.onError(error);
          }
        }
        setIsLoading(false);
      }
    },
    [input, messages, isLoading, options]
  );

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    setInput,
    stop,
  };
}
