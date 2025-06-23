"use client"

import { useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Download, FileSpreadsheet, Calculator, TrendingUp, AlertTriangle, CheckCircle, Save, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { calculateRiskScores } from "@/lib/calculate-risk"
import { hazardData } from "@/lib/hazard-data"
import { generateExcel } from "@/lib/excel-generator"
import { generatePDF } from "@/lib/pdf-generator"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import HazardTable from "@/components/HazardTable"

export function HazardAssessment() {
  const [assessmentData, setAssessmentData] = useState(hazardData)
  const [results, setResults] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [assessmentName, setAssessmentName] = useState<string>("")
  const [saveMessage, setSaveMessage] = useState<string>("")
  const { user } = useAuth()

  const handleCalculate = async () => {
    const calculatedResults = calculateRiskScores(assessmentData)
    setResults(calculatedResults)

    // Auto-save if user is logged in
    if (user) {
      await saveAssessment(calculatedResults, true)
    }
  }

  const saveAssessment = async (calculatedResults?: any, isAutoSave = false) => {
    if (!user) {
      if (!isAutoSave) {
        setSaveMessage("Please log in to save assessments")
        setTimeout(() => setSaveMessage(""), 3000)
      }
      return
    }

    setIsSaving(true)
    if (!isAutoSave) setSaveMessage("")

    try {
      const resultsToSave = calculatedResults || results
      const name = assessmentName.trim() || `Assessment ${new Date().toLocaleDateString()}`

      const { error } = await supabase.from("hva_assessments").insert({
        user_id: user.id,
        assessment_name: name,
        assessment_data: assessmentData,
        results_data: resultsToSave,
      })

      if (error) {
        console.error("Save error:", error)
        if (!isAutoSave) {
          setSaveMessage(`Error saving: ${error.message}`)
        }
      } else {
        if (!isAutoSave) {
          setSaveMessage("Assessment saved successfully!")
          setAssessmentName("")
          setTimeout(() => setSaveMessage(""), 3000)
        }
      }
    } catch (error) {
      console.error("Unexpected save error:", error)
      if (!isAutoSave) {
        setSaveMessage("Error saving assessment")
        setTimeout(() => setSaveMessage(""), 3000)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadExcel = async () => {
    if (!results) return

    try {
      setIsGenerating(true)
      const blob = generateExcel(results.hazardsWithScores, results)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `TIPNOW_HVA_Assessment_${new Date().toISOString().split("T")[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating Excel:", error)
      alert("Failed to generate Excel file. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!results) return

    try {
      setIsGenerating(true)
      const blob = await generatePDF(results.hazardsWithScores, results)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `TIPNOW_HVA_Report_${new Date().toISOString().split("T")[0]}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF report. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  // Calculate progress statistics
  const totalHazards = assessmentData.length
  const assessedHazards = assessmentData.filter((h) => h.probability > 0).length
  const progressPercentage = (assessedHazards / totalHazards) * 100

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Hazard Vulnerability Assessment</h1>
            <p className="text-blue-100 text-lg">TIPNOW Format - Comprehensive Risk Analysis</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-end">
            <div className="text-right">
              <div className="text-2xl font-bold">
                {assessedHazards}/{totalHazards}
              </div>
              <div className="text-blue-200 text-sm">Hazards Assessed</div>
            </div>
            <Progress value={progressPercentage} className="w-32 mt-2" />
          </div>
        </div>
      </div>

      {/* Instructions Section */}
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Info className="h-6 w-6 text-amber-600" />
            Instructions for Completing the HVA
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="prose max-w-none">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-blue-800 font-medium mb-2">
                <strong>Important:</strong> This HVA tool is a comprehensive risk assessment document. Complete it as it
                pertains to your specific facility and operational environment.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Assessment Process
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Review each hazard category (Natural, Technological, Human-Related)</li>
                  <li>
                    For each relevant hazard, assess the <strong>Probability</strong> (0-3 scale)
                  </li>
                  <li>
                    Enter historical <strong>Alerts</strong> and <strong>Activations</strong> data
                  </li>
                  <li>
                    Evaluate potential <strong>Impact</strong> across Human, Property, and Business domains
                  </li>
                  <li>
                    Assess your organization's <strong>Response Capability</strong>
                  </li>
                  <li>Click "Calculate Risk Scores" to generate your risk analysis</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-green-600" />
                  Scoring Guidelines
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong className="text-blue-700">Probability Scale:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>
                        • <strong>0 (N/A):</strong> Not applicable to your facility
                      </li>
                      <li>
                        • <strong>1 (Low):</strong> Unlikely to occur
                      </li>
                      <li>
                        • <strong>2 (Moderate):</strong> Possible occurrence
                      </li>
                      <li>
                        • <strong>3 (High):</strong> Likely to occur
                      </li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-orange-700">Impact & Response:</strong>
                    <p className="ml-4 mt-1">
                      Rate from 0 (N/A) to 3 (High/Good) based on potential severity and your preparedness level.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Considerations</h3>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">PROBABILITY Factors:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Known historical risk patterns</li>
                    <li>• Geographic and environmental factors</li>
                    <li>• Seasonal or cyclical patterns</li>
                    <li>• Regional vulnerability assessments</li>
                    <li>• Expert predictions and forecasts</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-orange-700 mb-2">IMPACT Considerations:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>
                      <strong>Human:</strong> Staff, patient, visitor safety
                    </li>
                    <li>
                      <strong>Property:</strong> Replacement and repair costs
                    </li>
                    <li>
                      <strong>Business:</strong> Operational disruption
                    </li>
                    <li>• Revenue loss potential</li>
                    <li>• Regulatory compliance issues</li>
                    <li>• Reputation and public image</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-green-700 mb-2">RESPONSE Capabilities:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>
                      <strong>Preparedness:</strong> Plans, training, drills
                    </li>
                    <li>
                      <strong>Internal:</strong> Staff, supplies, resources
                    </li>
                    <li>
                      <strong>External:</strong> Community partnerships
                    </li>
                    <li>• Emergency supply availability</li>
                    <li>• Backup system functionality</li>
                    <li>• Communication protocols</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Best Practices
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Involve multidisciplinary team members in the assessment process</li>
                <li>• Review and update assessments annually or after significant incidents</li>
                <li>• Use historical data from the past 10 years when available</li>
                <li>• Consider worst-case scenarios during peak operational periods</li>
                <li>• Document assumptions and rationale for future reference</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Name Input */}
      {user && (
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-3">
              <Save className="h-5 w-5 text-purple-600" />
              Assessment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="assessment-name">Assessment Name (Optional)</Label>
                <Input
                  id="assessment-name"
                  placeholder="Enter a name for this assessment..."
                  value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                  className="mt-1"
                />
              </div>
              {results && (
                <Button onClick={() => saveAssessment()} disabled={isSaving} variant="outline">
                  {isSaving ? "Saving..." : "Save Assessment"}
                </Button>
              )}
            </div>
            {saveMessage && (
              <div
                className={`mt-3 p-2 rounded text-sm ${
                  saveMessage.includes("Error") || saveMessage.includes("Failed")
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {saveMessage}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assessment Form */}
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Calculator className="h-6 w-6 text-blue-600" />
            Assessment Form
            <Badge variant="outline" className="ml-auto">
              {progressPercentage.toFixed(0)}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <HazardTable data={assessmentData} setData={setAssessmentData} />

          <div className="mt-8 flex justify-center">
            <Button size="lg" onClick={handleCalculate} className="px-8 py-3 text-lg font-semibold">
              <TrendingUp className="mr-2 h-5 w-5" />
              Calculate Risk Scores
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && results.topRisks && (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  Top Risk Hazards
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={results.topRisks} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        formatter={(value) => [isNaN(value) ? "0" : value.toString(), "Risk Score"]}
                        contentStyle={{
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="score"
                        fill="url(#colorGradient)"
                        radius={[4, 4, 0, 0]}
                        stroke="#3b82f6"
                        strokeWidth={1}
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Section */}
          <div className="space-y-6">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Assessment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Priority Actions Required:
                  </h4>
                  <ul className="space-y-2">
                    {results.topRisks.slice(0, 3).map((risk: any, index: number) => (
                      <li key={risk.name} className="flex items-start gap-2">
                        <Badge variant="destructive" className="text-xs">
                          {index + 1}
                        </Badge>
                        <span className="text-sm">{risk.name}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {risk.score}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-blue-700 mb-3">Resource Priorities:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Emergency response equipment
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Staff training programs
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Communication systems
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-green-700 mb-2">Overall Preparedness:</h4>
                  <p className="text-sm text-gray-700">{results.overallPreparedness || "Not available"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Export Section */}
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                <CardTitle className="text-lg">Export Reports</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Button
                  variant="outline"
                  onClick={handleDownloadExcel}
                  disabled={isGenerating}
                  className="w-full justify-start"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                  {isGenerating ? "Generating..." : "Download Excel (.xlsx)"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                  className="w-full justify-start"
                >
                  <Download className="mr-2 h-4 w-4 text-red-600" />
                  {isGenerating ? "Generating..." : "Download PDF Report"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
