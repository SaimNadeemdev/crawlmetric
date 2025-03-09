import { formatNumber } from "@/lib/utils"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface HistoricalVolumeResult {
  keyword: string
  search_volume: number
  historical_data: {
    year: number
    month: number
    search_volume: number
  }[]
}

export function HistoricalVolumeResults({ results }: { results: HistoricalVolumeResult[] }) {
  return (
    <div className="space-y-8">
      {results.map((result, index) => (
        <div key={index} className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="mb-4 text-lg font-semibold">{result.keyword}</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.historical_data}>
                  <XAxis
                    dataKey={(entry) => `${entry.year}-${String(entry.month).padStart(2, "0")}`}
                    tickFormatter={(value) => value.split("-")[1]}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => {
                      const [year, month] = value.split("-")
                      return `${year} ${new Date(2000, Number.parseInt(month) - 1).toLocaleString("default", { month: "long" })}`
                    }}
                    formatter={(value) => [formatNumber(value), "Search Volume"]}
                  />
                  <Line type="monotone" dataKey="search_volume" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

