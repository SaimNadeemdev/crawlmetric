import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface ContentMetricsSectionProps {
  siteAuditSummary: any;
}

export function ContentMetricsSection({ siteAuditSummary }: ContentMetricsSectionProps) {
  return (
    <div className="space-y-4 pt-2">
      <motion.div 
        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
        whileHover={{ x: 3 }}
        transition={{ duration: 0.2 }}
      >
        <p className="text-sm font-medium text-gray-700">Pages with Title</p>
        <Badge variant="outline" className="bg-green-50 text-green-600 border-0 rounded-full px-2.5 py-0.5">
          {siteAuditSummary?.content_metrics?.pages_with_title || 0}
        </Badge>
      </motion.div>
      <motion.div 
        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
        whileHover={{ x: 3 }}
        transition={{ duration: 0.2 }}
      >
        <p className="text-sm font-medium text-gray-700">Pages with Meta Description</p>
        <Badge variant="outline" className="bg-green-50 text-green-600 border-0 rounded-full px-2.5 py-0.5">
          {siteAuditSummary?.content_metrics?.pages_with_meta_description || 0}
        </Badge>
      </motion.div>
      <motion.div 
        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
        whileHover={{ x: 3 }}
        transition={{ duration: 0.2 }}
      >
        <p className="text-sm font-medium text-gray-700">Pages with H1</p>
        <Badge variant="outline" className="bg-green-50 text-green-600 border-0 rounded-full px-2.5 py-0.5">
          {siteAuditSummary?.content_metrics?.pages_with_h1 || 0}
        </Badge>
      </motion.div>
      <motion.div 
        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
        whileHover={{ x: 3 }}
        transition={{ duration: 0.2 }}
      >
        <p className="text-sm font-medium text-gray-700">Pages with Images</p>
        <Badge variant="outline" className="bg-green-50 text-green-600 border-0 rounded-full px-2.5 py-0.5">
          {siteAuditSummary?.content_metrics?.pages_with_images || 0}
        </Badge>
      </motion.div>
      <motion.div 
        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
        whileHover={{ x: 3 }}
        transition={{ duration: 0.2 }}
      >
        <p className="text-sm font-medium text-gray-700">Pages with Structured Data</p>
        <Badge variant="outline" className="bg-green-50 text-green-600 border-0 rounded-full px-2.5 py-0.5">
          {siteAuditSummary?.content_metrics?.pages_with_structured_data || 0}
        </Badge>
      </motion.div>
    </div>
  );
}
