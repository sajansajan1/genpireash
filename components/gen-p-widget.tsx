"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MessageCircle,
  Send,
  Sparkles,
  Bell,
  HelpCircle,
  ChevronRight,
  Calendar,
  Play,
  Hand,
  MessagesSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose, DialogTitle, VisuallyHidden } from "@/components/ui/dialog";
import { sendSupportMail } from "@/lib/supabase/emailSupportSender";
import { toast } from "@/hooks/use-toast";
import { useGetAnnouncementsStore } from "@/lib/zustand/admin/announcements/getAnnouncements";
// Mock data for Proactive AI
const aiInsights = [
  {
    id: 1,
    title: "Complete Your Product Specs",
    description: "You didn't finish adding specs to your last product. Let me help you complete it.",
    cta: "Add Specs",
  },
  {
    id: 2,
    title: "Generate Product Variations",
    description: "Want me to generate colorways or different angles for your latest product?",
    cta: "Generate Now",
  },
  {
    id: 3,
    title: "Tech Pack Ready",
    description: "Your tech pack is ready for export. Continue refining or download now.",
    cta: "Export Tech Pack",
  },
  {
    id: 4,
    title: "Build Your Brand DNA",
    description: "Unlock collection consistency by defining your brand's style and materials.",
    cta: "Get Started",
  },
];

// Mock FAQs
const faqs = [
  {
    question: "How do I create my first product?",
    answer:
      "Click New Product and follow the guided flow. You can start from a prompt, upload a sketch, or use an existing design as your base.",
  },
  {
    question: "What file formats can I export?",
    answer: "You can export PNG, SVG, PDF, and Excel files depending on the type of asset or tech pack you generate.",
  },
  {
    question: "How do I generate a Tech Pack?",
    answer:
      "Once you’re happy with your product, click Generate Tech Pack. Genpire will prepare a detailed PDF and Excel file containing specs, measurements, and manufacturer-ready information.",
  },
  {
    question: "Can I collaborate with my team?",
    answer:
      "Yes — upgrade to the Team Plan to invite collaborators, share products, and work together inside the editor.",
  },
  {
    question: "How does the AI Try-On work?",
    answer:
      "Open the Try-On Studio, pick your model type, and apply your product. Genpire will create realistic try-on visuals instantly.",
  },
  {
    question: "Can I create a full product collection?",
    answer:
      "Yes. Use Collection Generator to produce coordinated variations, new styles, and colorways from a single idea or product.",
  },
  {
    question: "Why did my export fail?",
    answer:
      "Exports usually fail if the product is still processing or if the file is too large. Wait a few seconds and try again. If it continues, contact support through Gen-P.",
  },
  {
    question: "Do you support manufacturing?",
    answer:
      "Yes — Genpire provides tools to prepare your product for manufacturing, including tech packs and specs. Supplier quoting is being rolled out soon.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Scroll down to the Contact Support section or send us a message directly through Gen-P. We typically reply within 24 hours.",
  },
];

export function GenPWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"new" | "ai" | "support" | "faq">("new");
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [productDemoModal, setProductDemoModal] = useState(false);
  const [productEditorDemoModal, setProductEditorDemoModal] = useState(false);
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatloading, setChatLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");
  const [conversation, setConversation] = useState<{ sender: "user" | "ai"; text: string }[]>([]);
  const { fetchGetAnnouncements, GetAnnouncements, refresGetAnnouncements } = useGetAnnouncementsStore();
  // Mock data for What's New

  useEffect(() => {
    const fetchData = async () => {
      if (!GetAnnouncements) {
        await fetchGetAnnouncements();
      }
    };

    fetchData();
  }, [fetchGetAnnouncements, GetAnnouncements]);

  const handleSubmit = async () => {
    setLoading(true);
    const result = await sendSupportMail({ userEmail: email, subject, message });
    setLoading(false);

    if (result.success) {
      setStatus("Message sent successfully!");
      setEmail("");
      setSubject("");
      setMessage("");
      toast({
        variant: "default",
        title: "Email Sent to support",
        description: "Email Sent successfully! You get reply within 24 hours",
      });
    } else {
      setStatus(`Error: ${result.error}`);
    }
  };

  const formatMessage = (text: string) => {
    return text
      .replace(/^### (.*)$/gm, "<h3>$1</h3>") // H3
      .replace(/^## (.*)$/gm, "<h2>$1</h2>") // H2 (optional)
      .replace(/^# (.*)$/gm, "<h1>$1</h1>") // H1 (optional)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold
      .replace(/^- (.*?)/gm, "• $1") // bullet points
      .replace(/\n/g, "<br />"); // new lines
  };

  const handleSendSupport = async () => {
    if (!input.trim()) return;
    setActiveTab("support");
    const userMessage = { sender: "user" as const, text: input };
    setConversation((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai-support-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await res.json();
      const aiMessage = { sender: "ai" as const, text: formatMessage(data.reply) };
      setConversation((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to fetch AI reply:", error);
      const errorMessage = {
        sender: "ai" as const,
        text: "Sorry, I'm having trouble connecting. Please try again later.",
      };
      setConversation((prev) => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50  w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden bg-gradient-to-br from-stone-800 to-stone-900 text-white shadow-2xl flex items-center justify-center group hover:shadow-stone-500/50 transition-all duration-300"
            style={{
              boxShadow: "0 0 30px rgba(28, 25, 23, 0.4)",
            }}
          >
            {/* Image fills entire button */}
            <img src="/gen-p.svg" alt="Gen-P" className="absolute inset-0 w-full h-full object-cover rounded-full" />

            {/* Optional hover overlay */}
            <div className="absolute inset-0 rounded-full bg-stone-700 opacity-0 group-hover:opacity-20 transition-opacity" />

            {/* Optional pulsating border */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full border-2 border-stone-400 pointer-events-none"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full lg:w-[600px] bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-stone-800 to-stone-900 text-white p-6 border-b border-stone-700">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex gap-2 items-center">
                      <h2 className="text-2xl font-bold mb-1">Meet Your Genpire Agent</h2>
                    </div>
                    <p className="text-stone-300 text-sm">Your intelligent guide through Genpire</p>
                  </div>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("new")}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                      activeTab === "new" ? "bg-white text-stone-900" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    <Bell className="w-4 h-4 inline-block mr-2" />
                    What's New
                  </button>
                  <button
                    onClick={() => setActiveTab("support")}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                      activeTab === "support" ? "bg-white text-stone-900" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    <MessagesSquare className="w-4 h-4 inline-block mr-2" />
                    Support
                  </button>
                  <button
                    onClick={() => setActiveTab("faq")}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                      activeTab === "faq" ? "bg-white text-stone-900" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 inline-block mr-2" />
                    Faq
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* What's New Tab */}
                {activeTab === "new" && (
                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-stone-900 mb-4">Platform Updates</h3>
                    {GetAnnouncements && GetAnnouncements.length > 0 ? (
                      GetAnnouncements.map((announcement: any) => (
                        <motion.div
                          key={announcement.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-stone-50 rounded-xl p-5 border border-stone-200 hover:border-stone-300 transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-stone-900">{announcement.title}</h4>
                            <span className="text-xs text-stone-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(announcement.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-stone-600 leading-relaxed mb-3">{announcement.description}</p>
                          {announcement.video_url && (
                            <div className="aspect-video bg-stone-200 rounded-lg overflow-hidden">
                              <iframe
                                className="w-full h-full"
                                src={announcement.video_url}
                                title={announcement.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-stone-500">No announcements found</div>
                    )}
                  </div>
                )}

                {/* Proactive AI Tab */}
                {activeTab === "ai" && (
                  <div className="p-6 space-y-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-stone-900 mb-1">Personalized Insights</h3>
                      <p className="text-sm text-stone-600">Based on your recent activity and workflow</p>
                    </div>
                    {aiInsights.map((insight, index) => (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-xl p-5 border border-stone-200 hover:border-stone-400 transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-stone-800 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-stone-900 mb-1">{insight.title}</h4>
                            <p className="text-sm text-stone-600 leading-relaxed mb-3">{insight.description}</p>
                            <Button size="sm" className="bg-stone-800 hover:bg-stone-900 text-white">
                              {insight.cta}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeTab === "support" && (
                  <div className="flex flex-col h-full bg-white">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {/* Show placeholder when empty */}
                      {conversation.length === 0 && !chatloading && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="p-4 bg-gradient-to-br from-stone-100 to-stone-200 rounded-full mb-4">
                            <MessageCircle className="h-8 w-8 text-stone-800" />
                          </div>

                          <h4 className="text-base font-semibold text-stone-900 mb-2">Start a Conversation</h4>

                          <p className="text-xs text-stone-500 max-w-[250px]">
                            Ask me anything or tell me what you need help with. I'm here to assist you.
                          </p>
                        </div>
                      )}
                      {conversation.map((message, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex items-end gap-2 ${
                            message.sender === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          {message.sender === "ai" && (
                            <div className="w-8 h-8 rounded-full bg-stone-800 flex-shrink-0 flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                              message.sender === "user" ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-800"
                            }`}
                          >
                            <div className="text-sm" dangerouslySetInnerHTML={{ __html: message.text }} />
                          </div>
                        </motion.div>
                      ))}
                      {chatloading && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-end gap-2 justify-start"
                        >
                          <div className="w-8 h-8 rounded-full bg-stone-800 flex-shrink-0 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                          <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-stone-100 text-stone-800">
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="h-2 w-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                              <span className="h-2 w-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                              <span className="h-2 w-2 bg-stone-400 rounded-full animate-bounce"></span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="p-4 bg-white border-t border-stone-300">
                      <div className="relative">
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && !chatloading && input.trim()) {
                              handleSendSupport();
                            }
                          }}
                          placeholder="Ask anything..."
                          className="w-full px-4 py-3 pr-12 rounded-xl border border-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent text-sm"
                        />
                        <Button
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-stone-800 transition-colors disabled:opacity-50 disabled:hover:text-stone-500"
                          onClick={handleSendSupport}
                          variant="default"
                          size="sm"
                          disabled={chatloading || !input.trim()}
                        >
                          <Send className="w-5 h-5" />
                        </Button>
                      </div>
                      <p className="text-xs text-stone-800 text-center mt-3">
                        This is an AI assistant. Results may be inaccurate.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "faq" && (
                  <div className="p-6 space-y-6">
                    {/* <div>
                      <h3 className="text-lg font-semibold text-stone-900 mb-3">Ask a Question</h3>
                      <div className="relative">
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && !chatloading && input.trim()) {
                              handleSendSupport();
                            }
                          }}
                          placeholder="Search guides, FAQs, and tutorials..."
                          className="w-full px-4 py-3 pr-12 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent text-sm"
                        />
                        <button
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                          onClick={handleSendSupport}
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div> */}
                    <div>
                      <h4 className="text-sm font-semibold text-stone-900 mb-3">Frequently Asked Questions</h4>
                      <div className="space-y-2">
                        {faqs.map((faq, index) => (
                          <details
                            key={index}
                            className="bg-stone-50 rounded-lg border border-stone-200 hover:border-stone-300 transition-all group"
                          >
                            <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-stone-900 list-none flex items-center justify-between">
                              {faq.question}
                              <ChevronRight className="w-4 h-4 text-stone-400 group-open:rotate-90 transition-transform" />
                            </summary>
                            <div className="px-4 pb-3 pt-1 text-sm text-stone-600">{faq.answer}</div>
                          </details>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-stone-900 mb-3">Quick Tutorials</h4>
                      <div className="space-y-2">
                        <button
                          className="w-full bg-stone-50 hover:bg-stone-100 rounded-lg p-3 border border-stone-200 flex items-center gap-3 transition-all text-left"
                          onClick={() => setIsDemoModalOpen(true)}
                        >
                          <div className="w-10 h-10 bg-stone-800 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-stone-900">Creating a Collection</p>
                            <p className="text-xs text-stone-500">2 min tutorial</p>
                          </div>
                        </button>
                        <button
                          className="w-full bg-stone-50 hover:bg-stone-100 rounded-lg p-3 border border-stone-200 flex items-center gap-3 transition-all text-left"
                          onClick={() => setProductDemoModal(true)}
                        >
                          <div className="w-10 h-10 bg-stone-800 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-stone-900">Create Real Life Studio Creatives</p>
                            <p className="text-xs text-stone-500">5 min tutorial</p>
                          </div>
                        </button>
                        <button
                          className="w-full bg-stone-50 hover:bg-stone-100 rounded-lg p-3 border border-stone-200 flex items-center gap-3 transition-all text-left"
                          onClick={() => setProductEditorDemoModal(true)}
                        >
                          <div className="w-10 h-10 bg-stone-800 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-stone-900">Meet Our AI Product Editor</p>
                            <p className="text-xs text-stone-500">5 min tutorial</p>
                          </div>
                        </button>
                      </div>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-5 border border-stone-200">
                      <h4 className="text-sm font-semibold text-stone-900 mb-3">Contact Support</h4>
                      <div className="space-y-3">
                        <input
                          type="email"
                          placeholder="Your Email"
                          className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent text-sm"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Subject"
                          className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent text-sm"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                        />
                        <textarea
                          placeholder="Describe your issue..."
                          rows={4}
                          className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent text-sm resize-none"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                        <button
                          className="w-full bg-stone-800 hover:bg-stone-900 text-white py-2 rounded-lg"
                          onClick={handleSubmit}
                          disabled={loading}
                        >
                          {loading ? "Sending..." : "Send Message"}
                        </button>
                        {status && <p className="text-xs text-stone-500 text-center">{status}</p>}
                        <p className="text-xs text-stone-500 text-center">We reply within 24 hours</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Dialog open={isDemoModalOpen} onOpenChange={setIsDemoModalOpen}>
        <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0">
          <VisuallyHidden>
            <DialogTitle>Genpire Product Creation Demo Video</DialogTitle>
          </VisuallyHidden>
          <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
            <DialogClose className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none text-white bg-black/50 hover:bg-black/70 p-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
            <div className="flex items-center justify-center w-full h-full">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/5IOxslxTXU8?si=Yk_zVqszSUFDsfJs"
                title="Genpire Product Creation Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={productDemoModal} onOpenChange={setProductDemoModal}>
        <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0">
          <VisuallyHidden>
            <DialogTitle>Genpire Product Creation Demo Video</DialogTitle>
          </VisuallyHidden>
          <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
            <DialogClose className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none text-white bg-black/50 hover:bg-black/70 p-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
            <div className="flex items-center justify-center w-full h-full">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/UT9h36TyX-A?si=EXHceXWrlWspby6A"
                title="Genpire Product Creation Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={productEditorDemoModal} onOpenChange={setProductEditorDemoModal}>
        <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0">
          <VisuallyHidden>
            <DialogTitle>Genpire Product Creation Demo Video</DialogTitle>
          </VisuallyHidden>
          <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
            <DialogClose className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none text-white bg-black/50 hover:bg-black/70 p-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
            <div className="flex items-center justify-center w-full h-full">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/uhcBFWXhoso?si=aLosOvPraSKdyC_O"
                title="Genpire Product Creation Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
