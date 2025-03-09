import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatNumber } from "@/lib/utils"

interface KeywordsForSiteResult {
  keyword: string
  search_volume: number
  position: number
  traffic: number
  traffic_cost: number
  url: string
  cpc: number
}

export function KeywordsForSiteResults({ results }: { results: KeywordsForSiteResult[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Keyword</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Search Volume</TableHead>
          <TableHead>Traffic</TableHead>
          <TableHead>Traffic Cost</TableHead>
          <TableHead>CPC</TableHead>
          <TableHead>URL</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((result, index) => (
          <TableRow key={index}>
            <TableCell>{result.keyword}</TableCell>
            <TableCell>{result.position}</TableCell>
            <TableCell>{formatNumber(result.search_volume)}</TableCell>
            <TableCell>{formatNumber(result.traffic)}</TableCell>
            <TableCell>${formatNumber(result.traffic_cost)}</TableCell>
            <TableCell>${result.cpc.toFixed(2)}</TableCell>
            <TableCell className="max-w-[200px] truncate">{result.url}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

