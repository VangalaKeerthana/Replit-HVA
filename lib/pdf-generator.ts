import { jsPDF } from "jspdf"
import "jspdf-autotable"
import type { UserOptions } from "jspdf-autotable"

// Extend the jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF
  }
}

export async function generatePDF(assessmentData: any[], results: any) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  let currentPage = 1

  // Helper function to add page numbers
  const addPageNumber = () => {
    doc.setFontSize(10)
    doc.setTextColor(128, 128, 128)
    doc.text(`Page ${currentPage}`, pageWidth - 20, pageHeight - 10)
    currentPage++
  }

  // COVER PAGE
  try {
    // Add logo if available (optional)
    // doc.addImage('/public/logo.png', 'PNG', 20, 20, 40, 20)
  } catch (error) {
    console.log("Logo not found, continuing without logo")
  }

  // Title
  doc.setFontSize(28)
  doc.setTextColor(59, 130, 246) // Blue color
  doc.setFont("helvetica", "bold")
  doc.text("TIPNOW HVA REPORT", pageWidth / 2, 60, { align: "center" })

  // Subtitle
  doc.setFontSize(16)
  doc.setTextColor(75, 85, 99) // Gray color
  doc.setFont("helvetica", "normal")
  doc.text("Hazard Vulnerability Assessment", pageWidth / 2, 75, { align: "center" })

  // Date
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 90, { align: "center" })

  // Cover page decorative elements
  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(2)
  doc.line(50, 100, pageWidth - 50, 100)

  // Assessment summary box on cover
  doc.setFillColor(248, 250, 252) // Light gray background
  doc.rect(30, 120, pageWidth - 60, 80, "F")
  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(1)
  doc.rect(30, 120, pageWidth - 60, 80, "S")

  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.setFont("helvetica", "bold")
  doc.text("Assessment Summary", pageWidth / 2, 135, { align: "center" })

  // Calculate summary statistics
  const totalHazards = assessmentData.filter((h) => h.probability > 0).length
  const totalRiskScore = results.hazardsWithScores.reduce((sum: number, h: any) => sum + (h.score || 0), 0)
  const avgRiskScore = totalHazards > 0 ? (totalRiskScore / totalHazards).toFixed(1) : "0"
  const highRiskHazards = results.hazardsWithScores.filter((h: any) => h.score >= 25).length
  const highRiskPercentage = totalHazards > 0 ? ((highRiskHazards / totalHazards) * 100).toFixed(1) : "0"

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(`Total Hazards Assessed: ${totalHazards}`, 40, 150)
  doc.text(`Average Risk Score: ${avgRiskScore}`, 40, 165)
  doc.text(`High-Risk Hazards (≥25): ${highRiskHazards} (${highRiskPercentage}%)`, 40, 180)

  addPageNumber()

  // PAGE 2: TOP RISKS CHART AND ANALYSIS
  doc.addPage()

  // Create chart data for visualization
  if (results && results.topRisks && results.topRisks.length > 0) {
    doc.setFontSize(18)
    doc.setTextColor(59, 130, 246)
    doc.setFont("helvetica", "bold")
    doc.text("Top 10 Risk Hazards", 20, 30)

    // Create a simple bar chart using rectangles
    const chartStartY = 50
    const chartHeight = 120
    const chartWidth = pageWidth - 40
    const maxScore = Math.max(...results.topRisks.slice(0, 10).map((r: any) => r.score))

    results.topRisks.slice(0, 10).forEach((risk: any, index: number) => {
      const barHeight = (risk.score / maxScore) * chartHeight
      const yPos = chartStartY + chartHeight - barHeight
      const barWidth = (chartWidth - 20) / 10 - 5

      // Draw bar
      const colors = [
        [239, 68, 68], // Red
        [245, 101, 101], // Light red
        [251, 146, 60], // Orange
        [252, 176, 64], // Light orange
        [250, 204, 21], // Yellow
        [163, 230, 53], // Light green
        [34, 197, 94], // Green
        [20, 184, 166], // Teal
        [59, 130, 246], // Blue
        [147, 51, 234], // Purple
      ]

      const color = colors[index] || [59, 130, 246]
      doc.setFillColor(color[0], color[1], color[2])
      doc.rect(20 + index * (barWidth + 5), yPos, barWidth, barHeight, "F")

      // Add score label on top of bar
      doc.setFontSize(8)
      doc.setTextColor(0, 0, 0)
      doc.text(risk.score.toString(), 20 + index * (barWidth + 5) + barWidth / 2, yPos - 2, { align: "center" })
    })

    // Add hazard names below chart (rotated for space)
    doc.setFontSize(8)
    results.topRisks.slice(0, 10).forEach((risk: any, index: number) => {
      const barWidth = (chartWidth - 20) / 10 - 5
      const xPos = 20 + index * (barWidth + 5) + barWidth / 2
      const truncatedName = risk.name.length > 12 ? risk.name.substring(0, 12) + "..." : risk.name

      doc.text(truncatedName, xPos, chartStartY + chartHeight + 15, {
        align: "center",
        angle: 45,
      })
    })
  }

  // RECOMMENDATIONS SECTION
  doc.setFontSize(16)
  doc.setTextColor(59, 130, 246)
  doc.setFont("helvetica", "bold")
  doc.text("Recommendations", 20, 200)

  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.setFont("helvetica", "bold")
  doc.text("Immediate Action Required:", 20, 215)

  doc.setFont("helvetica", "normal")
  if (results.topRisks && results.topRisks.length > 0) {
    results.topRisks.slice(0, 3).forEach((risk: any, index: number) => {
      doc.text(`${index + 1}. Address ${risk.name} (Risk Score: ${risk.score})`, 25, 225 + index * 8)
    })
  }

  doc.setFont("helvetica", "bold")
  doc.text("Resource Priorities:", 20, 255)
  doc.setFont("helvetica", "normal")
  doc.text("• Emergency response equipment and supplies", 25, 265)
  doc.text("• Staff training programs for high-risk scenarios", 25, 273)
  doc.text("• Communication system upgrades", 25, 281)

  addPageNumber()

  // PAGE 3: DETAILED DATA TABLE
  doc.addPage()

  doc.setFontSize(16)
  doc.setTextColor(59, 130, 246)
  doc.setFont("helvetica", "bold")
  doc.text("Detailed Assessment Data", 20, 30)

  // Prepare data for the comprehensive table
  const tableData = assessmentData.map((item) => [
    item.name,
    getProbabilityLabel(item.probability),
    item.alerts.toString(),
    item.activations.toString(),
    getImpactLabel(item.humanImpact),
    getImpactLabel(item.propertyImpact),
    getImpactLabel(item.businessImpact),
    getResponseLabel(item.preparedness),
    getResponseLabel(item.internalResponse),
    getResponseLabel(item.externalResponse),
    (item.score || 0).toString(),
  ])

  doc.autoTable({
    startY: 40,
    head: [
      [
        "Hazard",
        "Probability",
        "Alerts",
        "Activations",
        "Human Impact",
        "Property Impact",
        "Business Impact",
        "Preparedness",
        "Internal Response",
        "External Response",
        "Risk Score",
      ],
    ],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Hazard name
      1: { cellWidth: 15 }, // Probability
      2: { cellWidth: 12 }, // Alerts
      3: { cellWidth: 15 }, // Activations
      4: { cellWidth: 15 }, // Human Impact
      5: { cellWidth: 15 }, // Property Impact
      6: { cellWidth: 15 }, // Business Impact
      7: { cellWidth: 18 }, // Preparedness
      8: { cellWidth: 18 }, // Internal Response
      9: { cellWidth: 18 }, // External Response
      10: { cellWidth: 15 }, // Risk Score
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 10, right: 10 },
  })

  addPageNumber()

  return doc.output("blob")
}

function getProbabilityLabel(value: number): string {
  const labels = ["N/A", "Low", "Moderate", "High"]
  return labels[value] || "N/A"
}

function getImpactLabel(value: number): string {
  const labels = ["N/A", "Low", "Moderate", "High"]
  return labels[value] || "N/A"
}

function getResponseLabel(value: number): string {
  const labels = ["N/A", "Poor", "Fair", "Good"]
  return labels[value] || "N/A"
}
