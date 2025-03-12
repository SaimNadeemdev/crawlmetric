"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ArrowUpDown, Info, TrendingUp, BarChart, DollarSign, Users, Search, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatNumber, formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardFooter } from "@/components/ui/card"

// Helper function to get difficulty level
const getDifficultyLevel = (score: number): { label: string; variant: "destructive" | "warning" | "success" | "outline" | "default" } => {
  if (score >= 80) return { label: "Very Hard", variant: "destructive" };
  if (score >= 60) return { label: "Hard", variant: "destructive" };
  if (score >= 40) return { label: "Medium", variant: "warning" };
  if (score >= 20) return { label: "Easy", variant: "success" };
  return { label: "Very Easy", variant: "outline" };
}

// Helper function to get difficulty color
const getDifficultyColor = (score: number): string => {
  if (score >= 70) return "text-red-500";
  if (score >= 40) return "text-yellow-500";
  return "text-green-500";
}

// Helper function to get difficulty hex color for SVG
const getDifficultyHexColor = (score: number): string => {
  if (score >= 70) return "#ef4444"; // red-500
  if (score >= 40) return "#eab308"; // yellow-500
  return "#22c55e"; // green-500
}

// Helper function to get competition level
const getCompetitionLevel = (score: number): string => {
  if (score >= 0.8) return "Very High";
  if (score >= 0.6) return "High";
  if (score >= 0.4) return "Medium";
  if (score >= 0.2) return "Low";
  return "Very Low";
}

// Helper function to get competition color
const getCompetitionColor = (score: number): string => {
  if (score >= 0.7) return "bg-red-500";
  if (score >= 0.4) return "bg-yellow-500";
  return "bg-green-500";
}

// Helper function to detect if data is from Keywords for Site mode
const isKeywordsForSiteData = (data: any[], mode?: string): boolean => {
  // If mode is explicitly set to keywords_for_site, use that
  if (mode === "keywords_for_site") {
    return true;
  }
  
  if (!data || data.length === 0) {
    return false;
  }
  
  // Check if the first item has position property which is specific to Keywords for Site
  const hasPosition = data[0].position !== undefined;
  const hasMode = data[0].mode === "keywords_for_site";
  
  return hasPosition || hasMode;
};

// Custom No Data indicator with iOS styling
const NoDataIndicator = ({ message = "No data" }: { message?: string }) => (
  <div className="flex items-center justify-center py-2 px-3 rounded-full bg-white/90 border border-gray-100 text-gray-600 backdrop-blur-xl shadow-sm">
    <Info className="h-4 w-4 mr-2 text-gray-400" />
    <span className="text-sm font-medium">{message}</span>
  </div>
);

// Helper function for displaying missing data
const MissingDataCell = () => (
  <div className="text-center">
    <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-gray-500 dark:text-gray-400 text-sm">No data</span>
    </div>
  </div>
);

// Define the columns for the keyword research table
export const getColumns = (data: any[] = [], mode?: string): ColumnDef<any>[] => {
  // Detect if we're dealing with Keywords for Site data
  const isKeywordsForSite = isKeywordsForSiteData(data, mode);
  const isHistoricalData = mode === "historical_search_volume";
  
  // Base columns that are common to all modes
  const baseColumns: ColumnDef<any>[] = [
    {
      accessorKey: "keyword",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Keyword" />
      ),
      cell: ({ row }) => {
        const keyword = row.getValue("keyword") as string;
        
        // Get word count
        const wordCount = keyword.split(' ').length;
        
        // Determine keyword intent/type with more specific patterns
        const getKeywordIntent = (): { 
          intent: string; 
          color: string; 
          bgColor: string;
          icon: React.ReactNode;
        } => {
          // Informational queries
          if (/^(what|who|how|why|when|where|which|is|are|can|do|does|did)/i.test(keyword)) {
            return { 
              intent: "Informational", 
              color: "text-blue-600", 
              bgColor: "bg-blue-50",
              icon: <Info className="h-3 w-3" />
            };
          }
          
          // Navigational queries
          if (/\b(website|site|page|login|signin|sign in|homepage|official|url)\b/i.test(keyword)) {
            return { 
              intent: "Navigational", 
              color: "text-amber-600", 
              bgColor: "bg-amber-50",
              icon: <ExternalLink className="h-3 w-3" />
            };
          }
          
          // Transactional queries
          if (/\b(buy|price|discount|deal|cheap|order|purchase|subscription|cost)\b/i.test(keyword)) {
            return { 
              intent: "Transactional", 
              color: "text-green-600", 
              bgColor: "bg-green-50",
              icon: <div className="h-3 w-3 flex items-center justify-center font-bold">$</div>
            };
          }
          
          // Commercial investigation
          if (/\b(vs|versus|review|best|top|compare|comparison|alternative|difference between)\b/i.test(keyword)) {
            return { 
              intent: "Commercial", 
              color: "text-purple-600", 
              bgColor: "bg-purple-50",
              icon: <div className="h-3 w-3 flex items-center justify-center font-bold">★</div>
            };
          }
          
          // Default to general
          return { 
            intent: "General", 
            color: "text-gray-600", 
            bgColor: "bg-gray-50",
            icon: <div className="h-3 w-3 flex items-center justify-center">#</div>
          };
        };
        
        const keywordIntent = getKeywordIntent();
        
        // Determine if it's a long-tail keyword
        const isLongTail = wordCount >= 3;
        
        return (
          <div className="flex items-start space-x-2 py-1">
            <div className={`flex-shrink-0 w-6 h-6 ${keywordIntent.bgColor} rounded-full flex items-center justify-center ${keywordIntent.color}`}>
              {keywordIntent.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col">
                <div className="text-sm font-medium text-gray-900 truncate">{keyword}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${keywordIntent.bgColor} ${keywordIntent.color}`}>
                    {keywordIntent.intent}
                  </span>
                  
                  {isLongTail && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                      Long-tail
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      },
      size: 180,
    },
  ];

  // If this is Keywords for Site data, add position column first
  if (isKeywordsForSite) {
    // Position column removed as requested
  }

  // For historical search volume mode, add Year and Month columns before search volume
  if (isHistoricalData) {
    baseColumns.push({
      accessorKey: "year",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Year" />
      ),
      cell: ({ row }) => {
        const year = row.getValue("year") as number;
        if (!year) return <NoDataIndicator message="No data" />;
        return (
          <div className="text-center">
            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
              <span className="font-medium text-slate-700 dark:text-slate-300">{year}</span>
            </div>
          </div>
        );
      },
      size: 60,
    });
    
    baseColumns.push({
      accessorKey: "monthName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Month" />
      ),
      cell: ({ row }) => {
        const monthName = row.getValue("monthName") as string;
        if (!monthName) return <NoDataIndicator message="No data" />;
        const month = row.getValue("month") as number;
        
        // Get season-based styling
        const getMonthStyle = (monthNum: number): { bgColor: string; textColor: string; icon: string } => {
          // Winter (Dec, Jan, Feb)
          if (monthNum === 12 || monthNum === 1 || monthNum === 2) {
            return { bgColor: "bg-blue-50 dark:bg-blue-950/30", textColor: "text-blue-600 dark:text-blue-400", icon: "❄️" };
          }
          // Spring (Mar, Apr, May)
          if (monthNum >= 3 && monthNum <= 5) {
            return { bgColor: "bg-green-50 dark:bg-green-950/30", textColor: "text-green-600 dark:text-green-400", icon: "🌱" };
          }
          // Summer (Jun, Jul, Aug)
          if (monthNum >= 6 && monthNum <= 8) {
            return { bgColor: "bg-yellow-50 dark:bg-yellow-950/30", textColor: "text-yellow-600 dark:text-yellow-400", icon: "☀️" };
          }
          // Fall (Sep, Oct, Nov)
          return { bgColor: "bg-orange-50 dark:bg-orange-950/30", textColor: "text-orange-600 dark:text-orange-400", icon: "🍂" };
        };
        
        const style = getMonthStyle(month);
        
        return (
          <div className="text-center">
            <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full ${style.bgColor}`}>
              <span className="mr-1">{style.icon}</span>
              <span className={`font-medium ${style.textColor}`}>{monthName}</span>
            </div>
          </div>
        );
      },
      size: 100,
    });
  }

  // Add search volume column
  baseColumns.push({
    accessorKey: "search_volume",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Search Volume" />
    ),
    cell: ({ row }) => {
      const volume = row.getValue("search_volume") as number;
      
      if (!volume && volume !== 0) {
        return (
          <div className="flex justify-center">
            <NoDataIndicator />
          </div>
        );
      }
      
      return (
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <Search className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
            <span className="text-sm">{formatNumber(volume)}</span>
          </div>
        </div>
      );
    },
    size: 140,
  });

  // Add traffic column for Keywords for Site mode
  if (isKeywordsForSite) {
    baseColumns.push({
      accessorKey: "traffic",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Traffic" />
      ),
      cell: ({ row }) => {
        const traffic = row.getValue("traffic") as number;
        
        if (!traffic && traffic !== 0) {
          return (
            <div className="flex justify-center">
              <NoDataIndicator />
            </div>
          );
        }
        
        return (
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <BarChart className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
              <span className="text-sm">{formatNumber(traffic)}</span>
            </div>
          </div>
        );
      },
      size: 120,
    });
    
    // Add traffic cost column for Keywords for Site mode
    baseColumns.push({
      accessorKey: "traffic_cost",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Traffic Cost" />
      ),
      cell: ({ row }) => {
        const trafficCost = row.getValue("traffic_cost") as number;
        
        if (!trafficCost && trafficCost !== 0) {
          return (
            <div className="flex justify-center">
              <NoDataIndicator />
            </div>
          );
        }
        
        return (
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <DollarSign className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
              <span className="text-sm">{formatCurrency(trafficCost)}</span>
            </div>
          </div>
        );
      },
      size: 120,
    });
  }

  // Add SEO difficulty column
  baseColumns.push({
    accessorKey: "keyword_difficulty",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="SEO Difficulty" 
        description="A score from 0-100 indicating how difficult it would be to rank for this keyword"
      />
    ),
    cell: ({ row }) => {
      const score = row.getValue("keyword_difficulty") as number;
      
      if (!score && score !== 0) {
        return (
          <div className="flex justify-center">
            <NoDataIndicator />
          </div>
        );
      }
      
      // Get difficulty level
      const difficulty = getDifficultyLevel(score);
      
      // Calculate percentage for the circular progress
      const percentage = score;
      const strokeColor = getDifficultyHexColor(score);
      
      return (
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-10 h-10">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              {/* Background circle */}
              <circle 
                cx="18" 
                cy="18" 
                r="15.91549430918954" 
                fill="none" 
                stroke="#f3f4f6" 
                strokeWidth="3"
              />
              
              {/* Progress circle */}
              <circle 
                cx="18" 
                cy="18" 
                r="15.91549430918954" 
                fill="none" 
                stroke={strokeColor} 
                strokeWidth="3" 
                strokeDasharray={`${percentage} ${100 - percentage}`}
                strokeDashoffset="25"
                strokeLinecap="round"
              />
              
              {/* Text in the middle */}
              <text 
                x="18" 
                y="18.5" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                className="text-xs font-bold" 
                fill={strokeColor}
              >
                {Math.round(score)}
              </text>
            </svg>
          </div>
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
            difficulty.variant === 'destructive' ? 'bg-red-100 text-red-700' : 
            difficulty.variant === 'warning' ? 'bg-yellow-100 text-yellow-700' : 
            'bg-green-100 text-green-700'
          }`}>
            {difficulty.label}
          </span>
        </div>
      );
    },
    size: 140,
  });

  // Add competition column
  baseColumns.push({
    accessorKey: "competition",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="Competition" 
        description="A score from 0-1 indicating how competitive the keyword is"
      />
    ),
    cell: ({ row }) => {
      const competition = row.getValue("competition") as number;
      
      if (!competition && competition !== 0) {
        return (
          <div className="flex justify-center">
            <NoDataIndicator />
          </div>
        );
      }
      
      // Get competition level
      const level = getCompetitionLevel(competition);
      
      // Calculate percentage for the circular progress
      const percentage = competition * 100;
      
      // Determine color based on competition level
      const getCompetitionColor = (level: string): string => {
        switch (level) {
          case "Very High":
          case "High":
            return "#ef4444"; // red-500
          case "Medium":
            return "#f59e0b"; // amber-500
          case "Low":
          case "Very Low":
            return "#10b981"; // emerald-500
          default:
            return "#6b7280"; // gray-500
        }
      };
      
      const strokeColor = getCompetitionColor(level);
      
      return (
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-10 h-10">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              {/* Background circle */}
              <circle 
                cx="18" 
                cy="18" 
                r="15.91549430918954" 
                fill="none" 
                stroke="#f3f4f6" 
                strokeWidth="3"
              />
              
              {/* Progress circle */}
              <circle 
                cx="18" 
                cy="18" 
                r="15.91549430918954" 
                fill="none" 
                stroke={strokeColor} 
                strokeWidth="3" 
                strokeDasharray={`${percentage} ${100 - percentage}`}
                strokeDashoffset="25"
                strokeLinecap="round"
              />
              
              {/* Text in the middle */}
              <text 
                x="18" 
                y="18.5" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                className="text-2xs font-bold" 
                fill={strokeColor}
              >
                {competition.toFixed(1)}
              </text>
            </svg>
          </div>
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
            level === "Very High" || level === "High" ? 'bg-red-100 text-red-700' : 
            level === "Medium" ? 'bg-amber-100 text-amber-700' : 
            'bg-green-100 text-green-700'
          }`}>
            {level}
          </span>
        </div>
      );
    },
    size: 130,
  });

  // Add CPC column
  baseColumns.push({
    accessorKey: "cpc",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="CPC" 
        description="Cost Per Click - average bid price in USD"
      />
    ),
    cell: ({ row }) => {
      const cpc = row.getValue("cpc") as number;
      
      if (!cpc && cpc !== 0) {
        return (
          <div className="flex justify-center">
            <NoDataIndicator />
          </div>
        );
      }
      
      // Determine CPC level
      const getCpcLevel = (cpc: number): { level: string; color: string; bgColor: string } => {
        if (cpc >= 5) return { level: "Very High", color: "text-red-700", bgColor: "bg-red-100" };
        if (cpc >= 3) return { level: "High", color: "text-orange-700", bgColor: "bg-orange-100" };
        if (cpc >= 1) return { level: "Medium", color: "text-amber-700", bgColor: "bg-amber-100" };
        if (cpc >= 0.5) return { level: "Low", color: "text-green-700", bgColor: "bg-green-100" };
        return { level: "Very Low", color: "text-emerald-700", bgColor: "bg-emerald-100" };
      };
      
      const cpcInfo = getCpcLevel(cpc);
      
      return (
        <div className="flex flex-col items-center justify-center">
          <div className={`text-base font-medium ${cpcInfo.color}`}>
            ${cpc.toFixed(2)}
          </div>
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${cpcInfo.bgColor} ${cpcInfo.color}`}>
            {cpcInfo.level}
          </span>
        </div>
      );
    },
    size: 100,
  });

  // Add URL column for Keywords for Site mode
  if (isKeywordsForSite) {
    baseColumns.push({
      accessorKey: "url",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="URL" />
      ),
      cell: ({ row }) => {
        const url = row.getValue("url") as string;
        if (!url) return <MissingDataCell />;
        
        return (
          <div className="max-w-[120px] truncate">
            <a 
              href={url.startsWith('http') ? url : `https://${url}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center"
            >
              {url}
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        );
      },
      size: 160,
    });
  }
  
  return baseColumns;
};

// Export default columns for backward compatibility
export const columns = getColumns();
