"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Bot, X } from "lucide-react";

interface UnifiedPromptInterfaceProps {
  sections: string[];
  selectedSection: string | null;
  onSectionSelect: (section: string) => void;
  onPromptSubmit: (section: string, prompt: string) => void;
  isFloating?: boolean;
}

export function UnifiedPromptInterface({
  sections = [],
  selectedSection,
  onSectionSelect,
  onPromptSubmit,
  isFloating = false,
}: UnifiedPromptInterfaceProps) {
  const [prompt, setPrompt] = useState("");
  const [currentSection, setCurrentSection] = useState(selectedSection || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setPrompt("");
  }, [selectedSection]);

  const handleSubmit = () => {
    if (!selectedSection || !prompt.trim()) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      onPromptSubmit(selectedSection, prompt);
      setIsSubmitting(false);
      setPrompt("");
    }, 1500);
  };

  if (isFloating) {
    return (
      <>
        {/* Floating AI Button */}
        {!isOpen && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={() => setIsOpen(true)}
              className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <Bot className="w-6 h-6 text-white" />
            </Button>
          </div>
        )}

        {/* Centered modal overlay that slides up from bottom */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div
              className="w-full max-w-2xl transform transition-all duration-300 ease-out animate-in slide-in-from-bottom-4"
              style={{ marginBottom: "10vh" }}
            >
              <Card className="shadow-2xl border border-slate-200 bg-white/95 backdrop-blur-sm">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-900">AI Assistant</h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {sections.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Select Section to Refine</label>
                        <Select value={selectedSection || ""} onValueChange={(value) => onSectionSelect(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a section..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Improvements</SelectItem>
                            {sections.map((section) => (
                              <SelectItem key={section} value={section}>
                                {section}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedSection && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Refining: {selectedSection}
                      </Badge>
                    )}

                    <div>
                      <Textarea
                        placeholder="Describe how you'd like to improve this section..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={!selectedSection || isSubmitting}
                        className="min-h-[100px] resize-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleSubmit}
                        disabled={!selectedSection || !prompt.trim() || isSubmitting}
                        className="flex-1"
                      >
                        {isSubmitting ? (
                          <>
                            <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                            Refining...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Refine with AI
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Close
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-black" />
            <h3 className="font-semibold">Refine Tech Pack with AI</h3>
          </div>

          {sections.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Select Section to Refine</label>
              <Select value={selectedSection || ""} onValueChange={(value) => onSectionSelect(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a section..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Improvements</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedSection && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Sparkles className="h-3 w-3 mr-1" />
              Refining: {selectedSection}
            </Badge>
          )}

          <div>
            <Textarea
              placeholder="Describe how you'd like to improve this section..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={!selectedSection || isSubmitting}
              className="min-h-[100px] resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={!selectedSection || !prompt.trim() || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Refining...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Refine with AI
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
