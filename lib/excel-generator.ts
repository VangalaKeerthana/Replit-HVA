import * as XLSX from "xlsx"

export function generateExcel(assessmentData: any[], results: any) {
  // Create workbook
  const wb = XLSX.utils.book_new()

  // Prepare assessment data with proper headers
  const assessmentSheetData = [
    // Header row
    [
      "ID",
      "Hazard Name",
      "Probability",
      "Number of Alerts",
      "Number of Activations",
      "Human Impact",
      "Property Impact",
      "Business Impact",
      "Preparedness",
      "Internal Response",
      "External Response",
      "Risk Score",
    ],
    // Data rows
    ...assessmentData.map((item) => [
      item.id,
      item.name,
      getProbabilityLabel(item.probability),
      item.alerts,
      item.activations,
      getImpactLabel(item.humanImpact),
      getImpactLabel(item.propertyImpact),
      getImpactLabel(item.businessImpact),
      getResponseLabel(item.preparedness),
      getResponseLabel(item.internalResponse),
      getResponseLabel(item.externalResponse),
      item.score || 0,
    ]),
  ]

  // Create worksheet from array of arrays
  const assessmentWS = XLSX.utils.aoa_to_sheet(assessmentSheetData)

  // Set column widths
  const colWidths = [
    { wch: 5 }, // ID
    { wch: 25 }, // Hazard Name
    { wch: 12 }, // Probability
    { wch: 15 }, // Alerts
    { wch: 18 }, // Activations
    { wch: 15 }, // Human Impact
    { wch: 16 }, // Property Impact
    { wch: 16 }, // Business Impact
    { wch: 15 }, // Preparedness
    { wch: 17 }, // Internal Response
    { wch: 17 }, // External Response
    { wch: 12 }, // Risk Score
  ]
  assessmentWS["!cols"] = colWidths

  // Style the header row
  const headerRange = XLSX.utils.decode_range(assessmentWS["!ref"] || "A1:L1")
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
    if (!assessmentWS[cellAddress]) continue

    // Set header styling
    assessmentWS[cellAddress].s = {
      font: {
        bold: true,
        color: { rgb: "FFFFFF" },
      },
      fill: {
        fgColor: { rgb: "3B82F6" }, // Blue background
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    }
  }

  // Style data rows with alternating colors and borders
  for (let row = 1; row <= assessmentData.length; row++) {
    for (let col = 0; col < 12; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      if (!assessmentWS[cellAddress]) continue

      assessmentWS[cellAddress].s = {
        fill: {
          fgColor: { rgb: row % 2 === 0 ? "F8FAFC" : "FFFFFF" }, // Alternating row colors
        },
        alignment: {
          horizontal: col === 1 ? "left" : "center", // Left align hazard names, center others
          vertical: "center",
        },
        border: {
          top: { style: "thin", color: { rgb: "E5E7EB" } },
          bottom: { style: "thin", color: { rgb: "E5E7EB" } },
          left: { style: "thin", color: { rgb: "E5E7EB" } },
          right: { style: "thin", color: { rgb: "E5E7EB" } },
        },
      }

      // Bold and highlight high-risk scores
      if (col === 11 && assessmentWS[cellAddress].v >= 25) {
        assessmentWS[cellAddress].s.font = { bold: true, color: { rgb: "DC2626" } }
        assessmentWS[cellAddress].s.fill = { fgColor: { rgb: "FEE2E2" } }
      }
    }
  }

  // Freeze the top row
  assessmentWS["!freeze"] = { xSplit: 0, ySplit: 1 }

  // Add assessment data worksheet to workbook
  XLSX.utils.book_append_sheet(wb, assessmentWS, "HVA Assessment Data")

  // Create summary worksheet if results exist
  if (results && results.topRisks && results.topRisks.length > 0) {
    const summaryData = [
      ["TIPNOW HVA Assessment Summary"],
      [""],
      ["Generated Date:", new Date().toLocaleDateString()],
      [""],
      ["Top Risk Hazards:"],
      ["Rank", "Hazard Name", "Risk Score"],
      ...results.topRisks.slice(0, 10).map((risk: any, index: number) => [index + 1, risk.name, risk.score]),
      [""],
      ["Assessment Statistics:"],
      ["Total Hazards Assessed:", results.hazardsWithScores.filter((h: any) => h.probability > 0).length],
      [
        "Average Risk Score:",
        (
          results.hazardsWithScores.reduce((sum: number, h: any) => sum + (h.score || 0), 0) /
          Math.max(results.hazardsWithScores.filter((h: any) => h.probability > 0).length, 1)
        ).toFixed(1),
      ],
      ["High-Risk Hazards (≥25):", results.hazardsWithScores.filter((h: any) => h.score >= 25).length],
    ]

    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData)

    // Set column widths for summary
    summaryWS["!cols"] = [{ wch: 25 }, { wch: 30 }, { wch: 15 }]

    // Style the summary sheet
    // Title styling
    if (summaryWS["A1"]) {
      summaryWS["A1"].s = {
        font: { bold: true, sz: 16, color: { rgb: "3B82F6" } },
        alignment: { horizontal: "center" },
      }
    }

    // Header styling for top risks table
    const topRisksHeaderRow = 6
    for (let col = 0; col < 3; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: topRisksHeaderRow - 1, c: col })
      if (summaryWS[cellAddress]) {
        summaryWS[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "3B82F6" } },
          alignment: { horizontal: "center" },
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, summaryWS, "Summary")
  }

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })

  // Create Blob and return
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

  return blob
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
