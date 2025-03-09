"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ArrowUpDown, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatNumber } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { DataTableColumnHeader } from "../ui/data-table-column-header"

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
  if (score >= 80) return "bg-red-500"
  if (score >= 60) return "bg-orange-500"
  if (score >= 40) return "bg-yellow-500"
  if (score >= 20) return "bg-green-500"
  return "bg-emerald-500"
}

// Helper function to get competition color
const getCompetitionColor = (score: number): string => {
  if (score >= 0.7) return "bg-red-500"
  if (score >= 0.4) return "bg-yellow-500"
  return "bg-green-500"
}

// Helper function to detect if data is from Keywords for Site mode
const isKeywordsForSiteData = (data: any[], mode?: string): boolean => {
  // If mode is explicitly set to keywords_for_site, use that
  if (mode === "keywords_for_site") {
    console.log("[DEBUG] Mode explicitly set to keywords_for_site");
    return true;
  }
  
  if (!data || data.length === 0) {
    console.log("[DEBUG] Empty data array for isKeywordsForSiteData");
    return false;
  }
  
  // Log the first item for debugging
  console.log("[DEBUG] First item in data array for mode detection:", JSON.stringify(data[0], null, 2));
  
  // Check if the first item has position property which is specific to Keywords for Site
  const hasPosition = data[0].position !== undefined;
  
  console.log("[DEBUG] Has position:", hasPosition);
  
  return hasPosition;
};

// Define the columns for the keyword research table
export const getColumns = (data: any[] = [], mode?: string): ColumnDef<any>[] => {
  // Detect if we're dealing with Keywords for Site data
  const isKeywordsForSite = isKeywordsForSiteData(data, mode);
  console.log("[DEBUG] Is Keywords for Site data:", isKeywordsForSite, "Mode:", mode);
  
  // Base columns that are common to all modes
  const baseColumns: ColumnDef<any>[] = [
    {
      accessorKey: "keyword",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Keyword" />
      ),
      cell: ({ row }) => {
        const keyword = row.getValue("keyword") as string;
        return <div className="font-medium">{keyword}</div>;
      },
    },
  ];

  // If this is Keywords for Site data, add position column first
  if (isKeywordsForSite) {
    baseColumns.unshift({
      accessorKey: "position",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Position" />
      ),
      cell: ({ row }) => {
        const position = row.getValue("position") as number;
        return <div className="text-center">{position || 0}</div>;
      },
    });
  }

  // Add search volume column
  baseColumns.push({
    accessorKey: "search_volume",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Search Volume" />
    ),
    cell: ({ row }) => {
      const searchVolume = row.getValue("search_volume") as number;
      if (!searchVolume) return <div className="text-center text-muted-foreground">N/A</div>;
      return <div className="text-center">{formatNumber(searchVolume)}</div>;
    },
  });

  // Add traffic column for Keywords for Site mode
  if (isKeywordsForSite) {
    baseColumns.push({
      accessorKey: "traffic",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Traffic" />
      ),
      cell: ({ row }) => {
        // Try to get traffic from different possible fields
        const traffic = row.getValue("traffic") as number || 
                        row.original.etv || 
                        row.original.impressions_etv || 0;
        
        return <div className="text-center">{formatNumber(traffic)}</div>;
      },
    });
  }

  // Add SEO difficulty column
  baseColumns.push({
    accessorKey: "keyword_difficulty",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="SEO Difficulty" 
        description="Difficulty score from 0-100. Higher means more difficult to rank for." 
      />
    ),
    cell: ({ row }) => {
      const difficulty = row.getValue("keyword_difficulty") as number;
      const level = getDifficultyLevel(difficulty);
      return (
        <div className="text-center">
          {difficulty !== undefined && difficulty !== null ? (
            <div>
              <Badge variant={level.variant}>{difficulty}</Badge>
              <div className="text-xs text-muted-foreground mt-1">{level.label}</div>
            </div>
          ) : (
            <div className="text-muted-foreground">N/A</div>
          )}
        </div>
      );
    },
  });

  // Add competition column
  baseColumns.push({
    accessorKey: "competition",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Competition" />
    ),
    cell: ({ row }) => {
      const competition = row.getValue("competition") as number;
      
      if (competition === undefined || competition === null) {
        return <div className="text-center text-muted-foreground">N/A</div>;
      }
      
      // Format competition as percentage
      const competitionPercent = Math.round(competition * 100);
      
      return (
        <div className="text-center">
          <div className="w-full bg-muted rounded-full h-2.5 mb-1">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${competitionPercent}%` }}
            ></div>
          </div>
          <div className="text-xs text-muted-foreground">{competitionPercent}%</div>
        </div>
      );
    },
  });

  // Add URL column for Keywords for Site mode
  if (isKeywordsForSite) {
    baseColumns.push({
      accessorKey: "url",
      header: "URL",
      cell: ({ row }) => {
        // Try to get URL from different possible locations
        const url = row.getValue("url") || row.original.result_url || row.original.url_path || "";
        
        if (!url) {
          return <div className="text-center text-muted-foreground">N/A</div>;
        }
        
        // Extract domain for display
        let displayUrl = url;
        try {
          // Make sure URL has a protocol
          const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
          const urlObj = new URL(urlWithProtocol);
          displayUrl = urlObj.hostname + urlObj.pathname;
        } catch (e) {
          // If URL parsing fails, just use the original
          console.log("[DEBUG] Error parsing URL:", e);
        }
        
        return (
          <div className="flex items-center">
            <a 
              href={url.startsWith('http') ? url : `https://${url}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline flex items-center"
            >
              <span className="truncate max-w-[200px]">{displayUrl}</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        )
      },
    });
  }

  return baseColumns;
};

// Export default columns for backward compatibility
export const columns = getColumns();
