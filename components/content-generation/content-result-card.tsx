"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Copy, Download, Check } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"

interface ContentResultCardProps {
  title: string
  content: string
  downloadFileName?: string
  onDownload?: () => void
  onCopy?: () => void
}

export function ContentResultCard({
  title,
  content,
  downloadFileName,
  onDownload,
  onCopy,
}: ContentResultCardProps) {
  const [copied, setCopied] = useState(false);

  // Default copy handler if none provided
  const handleCopy = () => {
    if (onCopy) {
      onCopy();
    } else {
      navigator.clipboard.writeText(content);
    }
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle download button click
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }

    if (!downloadFileName) return;

    import('@/utils/client-utils').then(({ downloadFile }) => {
      downloadFile(
        content,
        downloadFileName,
        'text/plain'
      );
      toast.success(`Downloaded as ${downloadFileName}`);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <Card className="overflow-hidden border border-gray-200 rounded-[22px] bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400"></div>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-gray-800">{title}</CardTitle>
          <CardDescription className="text-gray-600">
            Your generated content is ready to use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-xl p-4 max-h-[400px] overflow-y-auto border border-gray-100 text-black whitespace-pre-wrap">
            {content}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-2 pb-4">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-gray-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          {downloadFileName && (
            <Button
              variant="default"
              size="sm"
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
