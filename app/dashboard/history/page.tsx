"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, FileText, Download, Database, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { generateExcel } from "@/lib/excel-generator"
import { generatePDF } from "@/lib/pdf-generator"
import { checkTableExists } from "@/lib/database-utils"

type Assessment = {
  id: string
  assessment_name: string
  created_at: string
  assessment_data: any
  results_data: any
}

export default function HistoryPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [tableExists, setTableExists] = useState<boolean | null>(null)
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [isCheckingTable, setIsCheckingTable] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      checkAndFetchAssessments()
    }
  }, [user])

  const checkAndFetchAssessments = async () => {
    if (!user) return

    setLoading(true)

    // First check if table exists
    const exists = await checkTableExists()
    setTableExists(exists)

    if (exists) {
      await fetchAssessments()
    } else {
      setLoading(false)
    }
  }

  const fetchAssessments = async () => {
    if (!user) return

    try {
      const { supabase } = require("@/lib/supabase")

      const { data, error } = await supabase
        .from("hva_assessments")
        .select("*")
        .eq("user_id", user.id) // Filter by authenticated user's ID
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching assessments:", error)
        if (error.message.includes("does not exist")) {
          setTableExists(false)
        }
      } else {
        // Group assessments by date and get top 3 hazards per assessment
        const groupedAssessments = data?.reduce((acc: any, assessment: any) => {
          const dateKey = new Date(assessment.created_at).toDateString()
          if (!acc[dateKey]) {
            acc[dateKey] = {
              date: assessment.created_at,
              assessment_name: assessment.assessment_name,
              hazards: [],
            }
          }
          acc[dateKey].hazards.push({
            name: assessment.hazard_name,
            score: assessment.score,
          })
          return acc
        }, {})

        // Convert to array and sort hazards by score, take top 3
        const processedAssessments = Object.values(groupedAssessments || {}).map((group: any) => ({
          ...group,
          hazards: group.hazards.sort((a: any, b: any) => b.score - a.score).slice(0, 3),
        }))

        setAssessments(processedAssessments || [])
        setTableExists(true)
      }
    } catch (error) {
      console.error("Error:", error)
      setTableExists(false)
    } finally {
      setLoading(false)
    }
  }

  const tryCreateTable = async () => {
    setIsCheckingTable(true)

    try {
      const { supabase } = require("@/lib/supabase")

      // Try to call the RPC function to create the table
      const { error } = await supabase.rpc("create_hva_table_if_not_exists")

      if (!error) {
        // Table created successfully, now fetch assessments
        setTableExists(true)
        await fetchAssessments()
      } else {
        console.error("Could not create table:", error)
      }
    } catch (error) {
      console.error("Error creating table:", error)
    } finally {
      setIsCheckingTable(false)
    }
  }

  const deleteAssessment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assessment?")) return

    try {
      const { error } = await supabase.from("hva_assessments").delete().eq("id", id)

      if (error) {
        console.error("Error deleting assessment:", error)
        alert("Failed to delete assessment")
      } else {
        setAssessments(assessments.filter((a) => a.id !== id))
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to delete assessment")
    }
  }

  const downloadExcel = async (assessment: Assessment) => {
    setIsGenerating(assessment.id)
    try {
      const blob = generateExcel(assessment.results_data.hazardsWithScores, assessment.results_data)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute(
        "download",
        `${assessment.assessment_name}_${new Date(assessment.created_at).toISOString().split("T")[0]}.xlsx`,
      )
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating Excel:", error)
      alert("Failed to generate Excel file")
    } finally {
      setIsGenerating(null)
    }
  }

  const downloadPDF = async (assessment: Assessment) => {
    setIsGenerating(assessment.id)
    try {
      const blob = await generatePDF(assessment.results_data.hazardsWithScores, assessment.results_data)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute(
        "download",
        `${assessment.assessment_name}_${new Date(assessment.created_at).toISOString().split("T")[0]}.pdf`,
      )
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF file")
    } finally {
      setIsGenerating(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Assessment History</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Assessment History</h1>
        <p className="text-gray-600">View and manage your previous HVA assessments</p>
      </div>

      {/* Database Setup Required */}
      {tableExists === false && (
        <div className="space-y-6">
          <Alert className="border-orange-200 bg-orange-50">
            <Database className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Database Setup Required</p>
                  <p className="text-sm">
                    The assessment history feature requires a database table. You have two options:
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-sm mb-2">Option 1: Automatic Setup (Try First)</p>
                    <Button
                      onClick={tryCreateTable}
                      disabled={isCheckingTable}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {isCheckingTable ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Setting up...
                        </>
                      ) : (
                        <>
                          <Database className="mr-2 h-4 w-4" />
                          Auto-Setup Database
                        </>
                      )}
                    </Button>
                  </div>

                  <div>
                    <p className="font-medium text-sm mb-2">Option 2: Manual Setup</p>
                    <p className="text-xs mb-2">If auto-setup doesn't work, run this in your Supabase SQL Editor:</p>
                    <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                      <pre>{`-- Copy and paste this into Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.hva_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_name TEXT NOT NULL,
  assessment_data JSONB NOT NULL,
  results_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.hva_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own assessments" ON public.hva_assessments
  FOR ALL USING (auth.uid() = user_id);`}</pre>
                    </div>
                    <Button onClick={checkAndFetchAssessments} variant="outline" size="sm" className="mt-2">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Check Again
                    </Button>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Show a preview of what the history will look like */}
          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="text-lg text-gray-500">Assessment History Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border-dashed">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-gray-400">Sample Assessment {i}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="h-4 w-4" />
                        {new Date().toLocaleDateString()}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Hazards Assessed:</span>
                        <Badge variant="outline" className="text-gray-400">
                          15
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled className="flex-1">
                          <FileText className="h-4 w-4 mr-1" />
                          Excel
                        </Button>
                        <Button variant="outline" size="sm" disabled className="flex-1">
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Normal Content - Table Exists */}
      {tableExists === true && (
        <>
          {assessments.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
                <p className="text-gray-500 mb-4">Create your first assessment to see it here.</p>
                <Button asChild>
                  <a href="/dashboard">Start New Assessment</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {assessments.map((assessment: any, index: number) => (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold truncate">{assessment.assessment_name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {new Date(assessment.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Top Hazards:</span>
                      <Badge variant="secondary">{assessment.hazards.length}</Badge>
                    </div>

                    <div className="space-y-2">
                      {assessment.hazards.map((hazard: any, hazardIndex: number) => (
                        <div key={hazardIndex} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 truncate">
                            {hazardIndex + 1}. {hazard.name}
                          </span>
                          <Badge
                            variant={hazard.score >= 25 ? "destructive" : hazard.score >= 15 ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {hazard.score}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
