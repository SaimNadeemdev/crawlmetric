"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Copy, Check, Calendar, Tag, FileText, Sparkles, Wand2, AlignLeft, Zap, MessageSquare } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { useContentGenerationContext } from "@/hooks/use-content-generation"
import type { ContentGenerationHistoryItem } from "@/contexts/content-generation-context"
import { Badge } from "@/components/ui/badge"

interface HistoryCardProps {
  item: ContentGenerationHistoryItem
  onDelete?: () => void
}

export function HistoryCard({ item }: HistoryCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Format the creation date if available
  const formattedDate = item.created_at 
    ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true })
    : "Recently";

  // Get a title and icon based on the type
  const getTitleAndIcon = () => {
    switch (item.type) {
      case "paraphrase":
        return { 
          title: "Paraphrased Content", 
          icon: <MessageSquare className="h-5 w-5 text-purple-500" />
        };
      case "text-summary":
        return { 
          title: "Text Summary", 
          icon: <AlignLeft className="h-5 w-5 text-blue-500" />
        };
      case "generate-text":
        return { 
          title: "Generated Content", 
          icon: <FileText className="h-5 w-5 text-green-500" />
        };
      case "generate-meta-tags":
        return { 
          title: "Meta Tags", 
          icon: <Tag className="h-5 w-5 text-orange-500" />
        };
      case "check-grammar":
        return { 
          title: "Grammar Check", 
          icon: <Zap className="h-5 w-5 text-amber-500" />
        };
      default:
        return { 
          title: "Generated Content", 
          icon: <Wand2 className="h-5 w-5 text-[#0071e3]" />
        };
    }
  };

  // Copy content to clipboard
  const handleCopy = () => {
    let textToCopy = item.result;
    
    // Format meta tags for copying if needed
    if (item.type === "generate-meta-tags" && typeof item.result === "string") {
      try {
        const metaTags = JSON.parse(item.result);
        if (metaTags.title && metaTags.description) {
          textToCopy = `<meta name="title" content="${metaTags.title}">\n<meta name="description" content="${metaTags.description}">`;
        }
      } catch (e) {
        // Use the original result if parsing fails
      }
    }
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Format the result based on the content type
  const renderResult = () => {
    try {
      if (item.type === "generate-meta-tags") {
        // Format meta tags result
        let metaTags = { title: "", description: "" };
        
        try {
          if (typeof item.result === "string") {
            metaTags = JSON.parse(item.result);
          } else if (typeof item.result === "object") {
            metaTags = item.result;
          }
        } catch (e) {
          // If parsing fails, display as is
          return (
            <div className="bg-gray-50 rounded-lg p-3 max-h-[200px] overflow-y-auto border border-gray-100 text-black whitespace-pre-wrap text-sm">
              {item.result}
            </div>
          );
        }
        
        return (
          <div className="space-y-3">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-orange-500" /> Meta Title
                </h5>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-100">
                  {metaTags.title?.length || 0} chars
                </Badge>
              </div>
              <p className="text-sm text-gray-800">{metaTags.title}</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <AlignLeft className="h-3.5 w-3.5 text-green-500" /> Meta Description
                </h5>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-100">
                  {metaTags.description?.length || 0} chars
                </Badge>
              </div>
              <p className="text-sm text-gray-800">{metaTags.description}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <h5 className="text-xs font-medium text-gray-600 mb-1">HTML Code</h5>
              <pre className="text-xs text-gray-800 overflow-x-auto">
                &lt;meta name="title" content="{metaTags.title}" /&gt;{"\n"}
                &lt;meta name="description" content="{metaTags.description}" /&gt;
              </pre>
            </div>
          </div>
        );
      } else if (item.type === "check-grammar") {
        // Format grammar check result
        let grammarResult = { corrected_text: "", errors: [] };
        
        try {
          if (typeof item.result === "string") {
            grammarResult = JSON.parse(item.result);
          } else if (typeof item.result === "object") {
            grammarResult = item.result;
          }
        } catch (e) {
          // If parsing fails, display as is
          return (
            <div className="bg-gray-50 rounded-lg p-3 max-h-[200px] overflow-y-auto border border-gray-100 text-black whitespace-pre-wrap text-sm">
              {item.result}
            </div>
          );
        }
        
        return (
          <div className="space-y-3">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h5 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" /> Corrected Text
              </h5>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{grammarResult.corrected_text}</p>
            </div>
            
            {Array.isArray(grammarResult.errors) && grammarResult.errors.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Errors Found ({grammarResult.errors.length})</h5>
                <div className="space-y-2">
                  {grammarResult.errors.slice(0, expanded ? undefined : 3).map((error, index) => (
                    <div key={index} className="bg-red-50 rounded p-2 text-xs text-red-800 border border-red-100">
                      {error}
                    </div>
                  ))}
                  {!expanded && grammarResult.errors.length > 3 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs w-full mt-1 text-gray-500 hover:text-gray-700"
                      onClick={() => setExpanded(true)}
                    >
                      Show {grammarResult.errors.length - 3} more errors
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      } else if (item.type === "text-summary") {
        // Format text summary result
        let summaryResult = item.result;
        
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-1">
              <h5 className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <AlignLeft className="h-3.5 w-3.5 text-blue-500" /> Summary
              </h5>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{summaryResult}</p>
          </div>
        );
      } else {
        // Default formatting for other types
        return (
          <div className="bg-gray-50 rounded-lg p-3 max-h-[200px] overflow-y-auto border border-gray-100 text-black whitespace-pre-wrap text-sm">
            {item.result}
          </div>
        );
      }
    } catch (error) {
      // Fallback if any error occurs during rendering
      return (
        <div className="bg-gray-50 rounded-lg p-3 max-h-[200px] overflow-y-auto border border-gray-100 text-black whitespace-pre-wrap text-sm">
          {typeof item.result === 'string' ? item.result : JSON.stringify(item.result, null, 2)}
        </div>
      );
    }
  };

  // Format the prompt based on the content type
  const renderPrompt = () => {
    try {
      if (typeof item.prompt === 'string') {
        return (
          <div className="bg-gray-50 rounded-lg p-3 text-sm border border-gray-100 text-gray-800 max-h-[150px] overflow-y-auto">
            {item.prompt.split('\\n').map((line, i) => (
              <span key={i}>
                {line.replace(/\\r/g, '')}
                <br />
              </span>
            ))}
          </div>
        );
      } else if (typeof item.prompt === 'object') {
        return (
          <div className="bg-gray-50 rounded-lg p-3 text-sm border border-gray-100 text-gray-800 max-h-[150px] overflow-y-auto">
            {Object.entries(item.prompt).map(([key, value]) => (
              <div key={key} className="mb-1">
                <span className="font-medium">{key}: </span>
                <span>{typeof value === 'string' 
                  ? value.replace(/\\n/g, ' ').replace(/\\r/g, '')
                  : JSON.stringify(value)}
                </span>
              </div>
            ))}
          </div>
        );
      } else {
        return (
          <div className="bg-gray-50 rounded-lg p-3 text-sm border border-gray-100 text-gray-800 max-h-[150px] overflow-y-auto">
            {JSON.stringify(item.prompt)}
          </div>
        );
      }
    } catch (error) {
      // Fallback if any error occurs during rendering
      return (
        <div className="bg-gray-50 rounded-lg p-3 text-sm border border-gray-100 text-gray-800 max-h-[150px] overflow-y-auto">
          {typeof item.prompt === 'string' ? item.prompt : JSON.stringify(item.prompt)}
        </div>
      );
    }
  };

  const { title, icon } = getTitleAndIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      layout
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <Card className="overflow-hidden border border-gray-200 rounded-[22px] bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500"></div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {icon}
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800">{title}</CardTitle>
                <CardDescription className="text-gray-600 flex items-center mt-1">
                  <Calendar className="h-3.5 w-3.5 mr-1 opacity-70" />
                  {formattedDate}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Show the prompt */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#0071e3]" /> Prompt:
            </h4>
            {renderPrompt()}
          </div>
          
          {/* Show the result */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <Wand2 className="h-3.5 w-3.5 text-[#0071e3]" /> Result:
            </h4>
            {renderResult()}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-2 pb-4">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-sm transition-colors"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
