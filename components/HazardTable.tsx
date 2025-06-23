"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, ChevronRight, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type HazardData = {
  id: number
  name: string
  probability: number
  alerts: number
  activations: number
  humanImpact: number
  propertyImpact: number
  businessImpact: number
  preparedness: number
  internalResponse: number
  externalResponse: number
}

type HazardTableProps = {
  data: HazardData[]
  setData: React.Dispatch<React.SetStateAction<HazardData[]>>
}

const probabilityLabels = ["N/A", "Low", "Moderate", "High"]
const impactLabels = ["N/A", "Low", "Moderate", "High"]
const responseLabels = ["N/A", "Poor", "Fair", "Good"]

export default function HazardTable({ data, setData }: HazardTableProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("natural")

  const updateHazardValue = (id: number, field: keyof HazardData, value: number) => {
    setData(data.map((hazard) => (hazard.id === id ? { ...hazard, [field]: value } : hazard)))
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTableCellElement>,
    id: number,
    field: keyof HazardData,
    currentValue: number,
    maxValue = 3,
  ) => {
    const safeValue = isNaN(currentValue) ? 0 : currentValue

    if (e.key === " " || e.code === "Space") {
      e.preventDefault()
      const newValue = (safeValue + 1) % (maxValue + 1)
      updateHazardValue(id, field, newValue)
    } else if ((e.key === "Backspace" || e.code === "Backspace") && (field === "alerts" || field === "activations")) {
      e.preventDefault()
      const newValue = Math.max(0, safeValue - 1)
      updateHazardValue(id, field, newValue)
    }
  }

  const renderValueCell = (
    id: number,
    field: keyof HazardData,
    value: number,
    labels: string[] = [],
    bgColorClass = "",
    textColorClass = "text-gray-900",
  ) => {
    const safeValue = isNaN(value) ? 0 : value

    return (
      <td
        tabIndex={0}
        className={cn(
          "p-3 text-center border border-gray-200 cursor-pointer transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
          "hover:shadow-md hover:scale-105 active:scale-95",
          bgColorClass,
          textColorClass,
          "font-medium text-sm",
        )}
        onKeyDown={(e) => handleKeyDown(e, id, field, safeValue)}
        onClick={() => {
          const newValue = labels.length > 0 ? (safeValue + 1) % labels.length : (safeValue + 1) % 4
          updateHazardValue(id, field, newValue)
        }}
      >
        <div className="flex flex-col items-center">
          <span className="font-semibold">{labels.length > 0 ? labels[safeValue] || "N/A" : safeValue.toString()}</span>
          {labels.length === 0 && <span className="text-xs text-gray-500 mt-1">Count</span>}
        </div>
      </td>
    )
  }

  // Group hazards by category
  const naturalHazards = data.filter((h) => h.id < 20)
  const technologicalHazards = data.filter((h) => h.id >= 20 && h.id < 35)
  const humanHazards = data.filter((h) => h.id >= 35)

  const renderHazardSection = (title: string, hazards: HazardData[], sectionKey: string, iconColor: string) => {
    const isExpanded = expandedSection === sectionKey
    const completedHazards = hazards.filter((h) => h.probability > 0).length

    return (
      <Card className="mb-6 shadow-lg border-0 overflow-hidden">
        <CardHeader
          className={cn(
            "cursor-pointer transition-all duration-200 hover:shadow-md",
            iconColor === "blue" && "bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200",
            iconColor === "orange" && "bg-gradient-to-r from-orange-50 to-orange-100 border-b-2 border-orange-200",
            iconColor === "green" && "bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200",
          )}
          onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
        >
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-600" />
              )}
              <span className="text-lg font-bold text-gray-800">{title}</span>
              <Badge variant="secondary" className="ml-2">
                {completedHazards}/{hazards.length} assessed
              </Badge>
            </div>
            <div className="text-sm text-gray-600">{isExpanded ? "Click to collapse" : "Click to expand"}</div>
          </CardTitle>
        </CardHeader>

        {isExpanded && (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 border border-gray-200 text-left font-bold text-gray-800 bg-gray-100">
                      <div className="flex items-center gap-2">
                        <span>Hazard</span>
                        <Info className="h-4 w-4 text-gray-500" />
                      </div>
                    </th>
                    <th
                      colSpan={3}
                      className="p-4 border border-gray-200 text-center font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>Likelihood Factors</span>
                      </div>
                    </th>
                    <th
                      colSpan={3}
                      className="p-4 border border-gray-200 text-center font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>Impact Assessment</span>
                      </div>
                    </th>
                    <th
                      colSpan={3}
                      className="p-4 border border-gray-200 text-center font-bold text-white bg-gradient-to-r from-green-500 to-green-600"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>Response Capability</span>
                      </div>
                    </th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="p-3 border border-gray-200 bg-gray-100"></th>
                    <th className="p-3 border border-gray-200 text-center font-semibold text-blue-800 bg-blue-50">
                      Probability
                    </th>
                    <th className="p-3 border border-gray-200 text-center font-semibold text-blue-800 bg-blue-50">
                      Alerts
                    </th>
                    <th className="p-3 border border-gray-200 text-center font-semibold text-blue-800 bg-blue-50">
                      Activations
                    </th>
                    <th className="p-3 border border-gray-200 text-center font-semibold text-orange-800 bg-orange-50">
                      Human
                    </th>
                    <th className="p-3 border border-gray-200 text-center font-semibold text-orange-800 bg-orange-50">
                      Property
                    </th>
                    <th className="p-3 border border-gray-200 text-center font-semibold text-orange-800 bg-orange-50">
                      Business
                    </th>
                    <th className="p-3 border border-gray-200 text-center font-semibold text-green-800 bg-green-50">
                      Preparedness
                    </th>
                    <th className="p-3 border border-gray-200 text-center font-semibold text-green-800 bg-green-50">
                      Internal
                    </th>
                    <th className="p-3 border border-gray-200 text-center font-semibold text-green-800 bg-green-50">
                      External
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {hazards.map((hazard, index) => (
                    <tr
                      key={hazard.id}
                      className={cn(
                        "transition-colors duration-150",
                        index % 2 === 0 ? "bg-white" : "bg-gray-50",
                        "hover:bg-blue-50",
                      )}
                    >
                      <td className="p-4 border border-gray-200 font-medium text-gray-900 bg-gray-50">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 font-mono">#{hazard.id}</span>
                          <span>{hazard.name}</span>
                        </div>
                      </td>
                      {renderValueCell(
                        hazard.id,
                        "probability",
                        hazard.probability,
                        probabilityLabels,
                        "bg-blue-50 hover:bg-blue-100",
                        "text-blue-900",
                      )}
                      {renderValueCell(
                        hazard.id,
                        "alerts",
                        hazard.alerts,
                        [],
                        "bg-blue-50 hover:bg-blue-100",
                        "text-blue-900",
                      )}
                      {renderValueCell(
                        hazard.id,
                        "activations",
                        hazard.activations,
                        [],
                        "bg-blue-50 hover:bg-blue-100",
                        "text-blue-900",
                      )}
                      {renderValueCell(
                        hazard.id,
                        "humanImpact",
                        hazard.humanImpact,
                        impactLabels,
                        "bg-orange-50 hover:bg-orange-100",
                        "text-orange-900",
                      )}
                      {renderValueCell(
                        hazard.id,
                        "propertyImpact",
                        hazard.propertyImpact,
                        impactLabels,
                        "bg-orange-50 hover:bg-orange-100",
                        "text-orange-900",
                      )}
                      {renderValueCell(
                        hazard.id,
                        "businessImpact",
                        hazard.businessImpact,
                        impactLabels,
                        "bg-orange-50 hover:bg-orange-100",
                        "text-orange-900",
                      )}
                      {renderValueCell(
                        hazard.id,
                        "preparedness",
                        hazard.preparedness,
                        responseLabels,
                        "bg-green-50 hover:bg-green-100",
                        "text-green-900",
                      )}
                      {renderValueCell(
                        hazard.id,
                        "internalResponse",
                        hazard.internalResponse,
                        responseLabels,
                        "bg-green-50 hover:bg-green-100",
                        "text-green-900",
                      )}
                      {renderValueCell(
                        hazard.id,
                        "externalResponse",
                        hazard.externalResponse,
                        responseLabels,
                        "bg-green-50 hover:bg-green-100",
                        "text-green-900",
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Info className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">How to Use This Assessment</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  <kbd className="px-2 py-1 bg-white rounded border text-xs font-mono">Space</kbd> - Cycle through
                  values for all fields
                </p>
                <p>
                  <kbd className="px-2 py-1 bg-white rounded border text-xs font-mono">Backspace</kbd> - Decrease Alerts
                  and Activations counts
                </p>
                <p>Click any cell to cycle through values, or use keyboard shortcuts for faster entry.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hazard Sections */}
      {renderHazardSection("Natural Hazards", naturalHazards, "natural", "blue")}
      {renderHazardSection("Technological Hazards", technologicalHazards, "technological", "orange")}
      {renderHazardSection("Human-Related Hazards", humanHazards, "human", "green")}
    </div>
  )
}
