"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"

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

export function HazardTable({ data, setData }: HazardTableProps) {
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
    if (e.key === " " || e.code === "Space") {
      e.preventDefault()
      const newValue = (currentValue + 1) % (maxValue + 1)
      updateHazardValue(id, field, newValue)
    } else if ((e.key === "Backspace" || e.code === "Backspace") && (field === "alerts" || field === "activations")) {
      e.preventDefault()
      const newValue = Math.max(0, currentValue - 1)
      updateHazardValue(id, field, newValue)
    }
  }

  const renderValueCell = (
    id: number,
    field: keyof HazardData,
    value: number,
    labels: string[] = [],
    bgColorClass = "",
  ) => {
    return (
      <td
        tabIndex={0}
        className={cn(
          "p-2 text-center border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500",
          bgColorClass,
        )}
        onKeyDown={(e) => handleKeyDown(e, id, field, value)}
        onClick={() => {
          const newValue = (value + 1) % labels.length
          updateHazardValue(id, field, newValue)
        }}
      >
        {labels.length > 0 ? labels[value] : value}
      </td>
    )
  }

  // Group hazards by category
  const naturalHazards = data.filter((h) => h.id < 20)
  const technologicalHazards = data.filter((h) => h.id >= 20 && h.id < 35)
  const humanHazards = data.filter((h) => h.id >= 35)

  const renderHazardSection = (title: string, hazards: HazardData[], sectionKey: string) => {
    const isExpanded = expandedSection === sectionKey

    return (
      <div className="mb-6">
        <h3
          className="text-lg font-medium mb-2 cursor-pointer flex items-center"
          onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
        >
          <span className="mr-2">{isExpanded ? "▼" : "►"}</span>
          {title}
        </h3>

        {isExpanded && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border bg-gray-100 text-left">Hazard</th>
                  <th colSpan={3} className="p-2 border bg-blue-100 text-center">
                    Likelihood
                  </th>
                  <th colSpan={3} className="p-2 border bg-orange-100 text-center">
                    Impact
                  </th>
                  <th colSpan={3} className="p-2 border bg-green-100 text-center">
                    Response
                  </th>
                </tr>
                <tr>
                  <th className="p-2 border bg-gray-100"></th>
                  <th className="p-2 border bg-blue-100 text-center">Probability</th>
                  <th className="p-2 border bg-blue-100 text-center">Alerts</th>
                  <th className="p-2 border bg-blue-100 text-center">Activations</th>
                  <th className="p-2 border bg-orange-100 text-center">Human</th>
                  <th className="p-2 border bg-orange-100 text-center">Property</th>
                  <th className="p-2 border bg-orange-100 text-center">Business</th>
                  <th className="p-2 border bg-green-100 text-center">Preparedness</th>
                  <th className="p-2 border bg-green-100 text-center">Internal</th>
                  <th className="p-2 border bg-green-100 text-center">External</th>
                </tr>
              </thead>
              <tbody>
                {hazards.map((hazard) => (
                  <tr key={hazard.id}>
                    <td className="p-2 border">{hazard.name}</td>
                    {renderValueCell(hazard.id, "probability", hazard.probability, probabilityLabels, "bg-blue-50")}
                    {renderValueCell(hazard.id, "alerts", hazard.alerts, [], "bg-blue-50")}
                    {renderValueCell(hazard.id, "activations", hazard.activations, [], "bg-blue-50")}
                    {renderValueCell(hazard.id, "humanImpact", hazard.humanImpact, impactLabels, "bg-orange-50")}
                    {renderValueCell(hazard.id, "propertyImpact", hazard.propertyImpact, impactLabels, "bg-orange-50")}
                    {renderValueCell(hazard.id, "businessImpact", hazard.businessImpact, impactLabels, "bg-orange-50")}
                    {renderValueCell(hazard.id, "preparedness", hazard.preparedness, responseLabels, "bg-green-50")}
                    {renderValueCell(
                      hazard.id,
                      "internalResponse",
                      hazard.internalResponse,
                      responseLabels,
                      "bg-green-50",
                    )}
                    {renderValueCell(
                      hazard.id,
                      "externalResponse",
                      hazard.externalResponse,
                      responseLabels,
                      "bg-green-50",
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <p className="mb-4 text-sm">
        Press <kbd className="px-2 py-1 bg-gray-100 rounded">Space</kbd> to cycle through values. For Alerts and
        Activations, use <kbd className="px-2 py-1 bg-gray-100 rounded">Backspace</kbd> to decrease.
      </p>

      {renderHazardSection("Natural Hazards", naturalHazards, "natural")}
      {renderHazardSection("Technological Hazards", technologicalHazards, "technological")}
      {renderHazardSection("Human-Related Hazards", humanHazards, "human")}
    </div>
  )
}
