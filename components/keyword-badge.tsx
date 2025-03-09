"use client"

import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export function KeywordBadge() {
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Badge
        variant="outline"
        className="px-4 py-1 text-sm font-medium bg-black/50 border-purple-500/50 text-purple-400 backdrop-blur-sm"
      >
        Keyword Tracker
      </Badge>
    </motion.div>
  )
}

