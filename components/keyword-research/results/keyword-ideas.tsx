import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatNumber } from "@/lib/utils"

interface KeywordIdeasResult {
  keyword: string
  search_volume: number
  cpc: number
  competition: number
  keyword_difficulty: number
  competition_level: string
}

export function KeywordIdeasResults({ results }: { results: KeywordIdeasResult[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Keyword</TableHead>
          <TableHead>Search Volume</TableHead>
          <TableHead>CPC</TableHead>
          <TableHead>Competition</TableHead>
          <TableHead>Difficulty</TableHead>
          <TableHead>Level</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((result, index) => (
          <TableRow key={index}>
            <TableCell>{result.keyword}</TableCell>
            <TableCell>{formatNumber(result.search_volume)}</TableCell>
            <TableCell>${result.cpc.toFixed(2)}</TableCell>
            <TableCell>{(result.competition * 100).toFixed(0)}%</TableCell>
            <TableCell>{result.keyword_difficulty}</TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                ${
                  result.competition_level === "HIGH"
                    ? "bg-red-100 text-red-700"
                    : result.competition_level === "MEDIUM"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                {result.competition_level}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

