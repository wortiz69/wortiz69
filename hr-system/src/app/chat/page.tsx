"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "How many vacation days do I have left?",
  "What is the parental leave policy?",
  "How do I request a leave of absence?",
  "When is the next performance review cycle?",
  "What benefits am I eligible for?",
  "How do I update my direct deposit information?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your HR assistant powered by Claude AI. I can help you with leave policies, benefits information, performance reviews, and general HR questions. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`session-${Date.now()}`);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", timestamp: new Date() },
    ]);

    try {
      // In production: POST /api/chat with streaming
      // For demo, simulate a response
      const demoResponse = getDemoResponse(text);
      let partial = "";
      for (const char of demoResponse) {
        await new Promise((r) => setTimeout(r, 15));
        partial += char;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: partial } : m))
        );
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <Header
        title="HR Chat"
        subtitle="Ask me anything about HR policies, benefits, or your employment."
      />

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Suggested Questions */}
        <div className="w-64 flex-shrink-0">
          <Card className="h-full">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Suggested Topics</h3>
            <ul className="space-y-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <li key={q}>
                  <button
                    className="w-full text-left text-xs text-gray-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg px-3 py-2 transition-colors"
                    onClick={() => sendMessage(q)}
                    disabled={isStreaming}
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col card min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="mr-3 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-lg rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-primary-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  {msg.content || (
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                className="input flex-1"
                placeholder="Ask an HR question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isStreaming}
              />
              <button type="submit" className="btn-primary" disabled={isStreaming || !input.trim()}>
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function getDemoResponse(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("vacation") || q.includes("days")) {
    return "Based on your profile, you have 10 vacation days remaining for this year. You've used 5 out of your 15-day entitlement. Would you like to request time off?";
  }
  if (q.includes("parental") || q.includes("maternity") || q.includes("paternity")) {
    return "Our parental leave policy provides 12 weeks of fully paid leave for primary caregivers and 4 weeks for secondary caregivers. This applies to birth, adoption, and foster placement. Leave can begin up to 4 weeks before the expected due date.";
  }
  if (q.includes("performance") || q.includes("review")) {
    return "The next performance review cycle begins July 1st. You'll be asked to complete a self-assessment by July 15th. Your manager will then schedule a 1-on-1 to discuss the review. Results are typically shared by August 1st.";
  }
  if (q.includes("benefit")) {
    return "You're currently enrolled in the Premium Health plan, Dental Plus, and Vision Basic. Open enrollment runs November 1-15. You can also enroll in the 401(k) at any time — the company matches up to 4% of your salary.";
  }
  return "That's a great question! I'd be happy to help. For the most accurate and up-to-date information on this topic, I recommend checking the HR portal or reaching out to hr@company.com. Is there anything else I can assist you with?";
}
