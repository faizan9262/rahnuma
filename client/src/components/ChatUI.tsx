import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Card } from "./ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { formatAiText } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { chatWithDoc } from "@/libs/apis/search";
import { useDocumentStore } from "@/stores/documentStore";
import { ArrowRight } from "lucide-react";
import type { ChatResponse, Message } from "@/types";

const initialDummyChat: Message[] = [
  { sender: "ai", text: "Hello! Ask me anything about your document." },
];

type ContextRole = "user" | "assistant" | "system";

interface ContextMessage {
  role: ContextRole;
  content: string;
}

const Chat = () => {
  const { selectedDoc, addMessage, chats } = useDocumentStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, selectedDoc, loading]);

  if (!selectedDoc) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted">
        <span className="text-lg text-foreground">
          Select a document to start chatting.
        </span>
      </div>
    );
  }

  // Always use the store as the source of truth
  const messages = selectedDoc ? chats[selectedDoc.id] || initialDummyChat : [];

  

  const sendMessage = async () => {
    if (!input.trim() || !selectedDoc) return;

    const userMsg: Message = { sender: "user", text: input };

    // ✅ Only add to store, do NOT use local state
    addMessage(selectedDoc.id, userMsg);
    setInput("");
    setLoading(true);

    try {
      console.log("Chats: ", chats);
      const aiContext: ContextMessage[] = [
        {
          role: "system",
          content:
            "You are a helpful assistant answering questions about the user's document. Use the document context to provide accurate and concise answers.",
        },
        ...(chats[selectedDoc.id] ?? []).map(
          (msg): ContextMessage => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          })
        ),
        { role: "user", content: input },
      ];

      const response = await chatWithDoc(selectedDoc.id, input, aiContext);
      const data: ChatResponse = response.data.results;

      const aiMsg: Message = {
        sender: "ai",
        text: data.answer ?? "No response available",
        sources: data.source_chunks ?? [],
      };

      addMessage(selectedDoc.id, aiMsg);
    } catch (error) {
      console.error(error);
      addMessage(selectedDoc.id, {
        sender: "ai",
        text: "⚠️ Failed to get a response. Please try again.",
        sources: [],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full p-2">
      {/* Messages */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-end gap-2 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "ai" && (
              <div className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full bg-primary text-card-dark font-bold text-xs">
                R
              </div>
            )}

            <Card
              className={`max-w-[90%] md:max-w-[70%] p-4 rounded-2xl ${
                msg.sender === "user"
                  ? "bg-primary text-card-dark rounded-br-none"
                  : "bg-card-dark text-foreground border border-border rounded-tl-none"
              }`}
            >
              {msg.sender === "ai" ? (
                <div className="prose prose-invert md:text-lg leading-6">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="mb-2" {...props} />
                      ),
                    }}
                  >
                    {formatAiText(msg.text)}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-sm leading-6">{msg.text}</div>
              )}
            </Card>

            {msg.sender === "user" && (
              <img
                src={user?.profile_picture}
                alt="profile"
                className="hidden sm:flex w-8 h-8 rounded-full object-cover"
              />
            )}
          </motion.div>
        ))}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-end gap-2 justify-start"
          >
            <div className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full bg-primary text-card-dark font-bold text-xs">
              R
            </div>
            <Card className="bg-card-dark text-primary border border-border px-4 py-3 rounded-2xl rounded-tl-none">
              <span className="animate-pulse">🪄 Thinking...</span>
            </Card>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="mt-4 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask Anything About Your Doc..."
          className="w-full rounded-xl p-3 pr-12 bg-muted border border-border text-foreground placeholder:text-primary/50 focus:outline-none focus:ring-2 focus:ring-primary transition"
        />
        <button
          onClick={sendMessage}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-primary/90 transition"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Chat;
