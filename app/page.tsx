"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Shield, TrendingUp, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Shield className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">TIPNOW Hazard Vulnerability Assessment</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Comprehensive risk analysis and emergency preparedness planning for healthcare facilities and organizations.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="px-8 py-3 text-lg">
                <FileText className="mr-2 h-5 w-5" />
                Start Assessment
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Evaluate natural, technological, and human-related hazards with comprehensive scoring methodology.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Visual Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Interactive charts and visualizations to identify top risks and prioritize response efforts.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <FileText className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Export Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Generate professional PDF reports and Excel spreadsheets for documentation and compliance.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
