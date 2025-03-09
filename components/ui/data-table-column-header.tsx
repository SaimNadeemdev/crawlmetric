"use client"

import { Column } from "@tanstack/react-table"
import { ArrowUpDown, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
  description?: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  description,
}: DataTableColumnHeaderProps<TData, TValue>) {
  return (
    <div className="flex items-center justify-center space-x-1">
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="font-semibold"
      >
        {title}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
      
      {description && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
