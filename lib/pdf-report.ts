"use client"

import type { Keyword } from "@/types/keyword"

export async function generatePdfReport(keywords: Keyword[]) {
  try {
    // Dynamically import jsPDF and jspdf-autotable only when needed
    const jsPDFModule = await import("jspdf")
    const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF
    const autoTableModule = await import("jspdf-autotable")
    const autoTable = autoTableModule.default

    // Create a new PDF document
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.setTextColor(33, 107, 219)
    doc.text("Keyword Ranking Report", 14, 22)

    // Add date
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 30)

    // Add summary
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(`Total Keywords: ${keywords.length}`, 14, 40)

    // Calculate summary statistics
    const rankingKeywords = keywords.filter((k) => k.current_rank !== null)
    const top10Keywords = rankingKeywords.filter((k) => k.current_rank && k.current_rank <= 10).length
    const top50Keywords = rankingKeywords.filter((k) => k.current_rank && k.current_rank <= 50).length
    const notRankingKeywords = keywords.filter((k) => k.current_rank === null).length

    doc.text(`Keywords in Top 10: ${top10Keywords}`, 14, 48)
    doc.text(`Keywords in Top 50: ${top50Keywords}`, 14, 56)
    doc.text(`Keywords Not Ranking: ${notRankingKeywords}`, 14, 64)

    // Create table for all keywords
    autoTable(doc, {
      startY: 70,
      head: [["Keyword", "Domain", "Current Rank", "Previous Rank", "Best Rank"]],
      body: keywords.map((k) => [
        k.keyword,
        k.domain,
        k.current_rank ? `#${k.current_rank}` : "Not Ranking",
        k.previous_rank ? `#${k.previous_rank}` : "N/A",
        k.best_rank ? `#${k.best_rank}` : "N/A",
      ]),
      headStyles: { fillColor: [33, 107, 219] },
    })

    // Save the PDF
    doc.save("keyword-ranking-report.pdf")

    return true
  } catch (error) {
    console.error("Error generating PDF report:", error)
    // Don't throw the error, just return false to indicate failure
    return false
  }
}

