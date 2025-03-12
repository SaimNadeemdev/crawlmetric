"use client"

import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export function KeywordBadge() {
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Badge
        variant="outline"
        className="px-4 py-1 text-sm font-medium bg-black/50 border-[#06c] border-2 text-[#06c] backdrop-blur-sm"
      >
        Keyword Tracker
      </Badge>
    </motion.div>
  )
}
