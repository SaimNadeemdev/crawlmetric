import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

interface BulkDifficultyResult {
  keyword: string
  keyword_difficulty: number
  search_volume: number
}

export function BulkDifficultyResults({ results }: { results: BulkDifficultyResult[] }) {
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty >= 80) return "text-red-500"
    if (difficulty >= 60) return "text-orange-500"
    if (difficulty >= 40) return "text-yellow-500"
    return "text-green-500"
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Keyword</TableHead>
          <TableHead>Difficulty</TableHead>
          <TableHead>Search Volume</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((result, index) => (
          <TableRow key={index}>
            <TableCell>{result.keyword}</TableCell>
            <TableCell>
              <div className="flex items-center gap-4">
                <Progress value={result.keyword_difficulty} className="w-[100px]" />
                <span className={getDifficultyColor(result.keyword_difficulty)}>{result.keyword_difficulty}</span>
              </div>
            </TableCell>
            <TableCell>{result.search_volume.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

