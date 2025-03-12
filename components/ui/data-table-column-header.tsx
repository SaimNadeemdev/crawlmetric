"use client"

import { Column } from "@tanstack/react-table"
import { ChevronsUpDown, ArrowUpDown, EyeOff, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
  description?: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  description,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <span className="text-xs font-medium">{title}</span>
        {description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[200px] text-xs">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-between space-x-2 px-1", className)}>
      <div className="flex items-center">
        <span className="text-xs font-medium whitespace-nowrap mr-2">{title}</span>
        {description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[200px] text-xs">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-6 w-6 p-0 data-[state=open]:bg-accent"
        onClick={() => column.toggleSorting()}
      >
        <ArrowUpDown className="h-3 w-3" />
      </Button>
    </div>
  )
}
