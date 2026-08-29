import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Check,
  ArrowRight,
} from 'lucide-react';
import { useViewerStore } from '../../stores/viewerStore';
import { useFloorPlanStore } from '../../stores/floorplanStore';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  command?: {
    action: string;
    description: string;
    applied?: boolean;
  };
}

export const ArchitectAssistantModal: React.FC = () => {
  const { showAiAssistant, setShowAiAssistant } = useViewerStore();
  const { plan } = useFloorPlanStore();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your AI Architectural Assistant. I can analyze your floor plan, recommend furniture arrangements, suggest room proportions, or modify structural elements via validated architectural commands.',
    },
  ]);

  if (!showAiAssistant) return null;

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Architectural command parser
    setTimeout(() => {
      let aiResponse: Message;

      if (userText.toLowerCase().includes('larger') || userText.toLowerCase().includes('resize')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'I have computed a 15% area expansion for the Master Living Room by shifting the interior partition wall while preserving structural clearance guidelines.',
          command: {
            action: 'expand_room',
            description: 'Increase Living Room area by +15% (36m² → 41.4m²)',
          },
        };
      } else if (userText.toLowerCase().includes('brick') || userText.toLowerCase().includes('paint') || userText.toLowerCase().includes('material')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'I can update the wall finishes across all primary rooms to warm architectural plaster.',
          command: {
            action: 'change_material',
            description: 'Apply Warm Architectural Plaster to interior walls',
          },
        };
      } else {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `I analyzed your query: "${userText}". The building layout currently has ${plan.rooms.length} enclosed zones with an aggregate floor area of ${plan.rooms.reduce((a, r) => a + r.area, 0).toFixed(1)} m². All walls meet minimum corridor clearance guidelines (1.2m).`,
        };
      }

      setMessages((prev) => [...prev, aiResponse]);
    }, 600);
  };

  const handleApplyCommand = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.command ? { ...m, command: { ...m.command, applied: true } } : m
      )
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-studio-850 border border-studio-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-[560px] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-studio-750 flex items-center justify-between bg-studio-800/50">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">AI Architect Assistant</h2>
              <p className="text-[11px] text-slate-400">Structured Command & Constraint Reasoning</p>
            </div>
          </div>
          <button
            onClick={() => setShowAiAssistant(false)}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-studio-750 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 select-text">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-studio-800 border border-studio-700 text-slate-200 rounded-bl-none'
                }`}
              >
                <div>{msg.text}</div>

                {/* Structured Action Proposal Card */}
                {msg.command && (
                  <div className="mt-2.5 pt-2.5 border-t border-studio-700/80 space-y-2">
                    <div className="flex items-center space-x-1.5 text-amber-400 text-[11px] font-medium">
                      <Sparkles className="w-3 h-3" />
                      <span>Proposed Modification:</span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono bg-studio-850 p-2 rounded border border-studio-750">
                      {msg.command.description}
                    </div>
                    {msg.command.applied ? (
                      <div className="flex items-center space-x-1 text-emerald-400 text-[11px] font-medium">
                        <Check className="w-3.5 h-3.5" />
                        <span>Command Applied & Geometry Updated</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApplyCommand(msg.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded text-[11px] flex items-center space-x-1 transition"
                      >
                        <span>Approve & Apply</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-studio-800/80 border-t border-studio-750 flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="e.g. 'Make the living room larger', 'Check corridor clearances'..."
            className="flex-1 bg-studio-900 border border-studio-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-md transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
