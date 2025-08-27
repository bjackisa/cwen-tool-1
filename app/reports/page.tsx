"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Download, FileText, BarChart3, Users, MapPin } from "lucide-react"
import Link from "next/link"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

export default function ReportsPage() {
  const [reportType, setReportType] = useState<string>("")
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([])
  const [selectedGenders, setSelectedGenders] = useState<string[]>([])
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeRawData, setIncludeRawData] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)
  const chartData = [
    { name: "Male", value: 60 },
    { name: "Female", value: 40 },
  ]

  const reportTypes = [
    { value: "comprehensive", label: "Comprehensive Report", description: "Complete analysis of all survey data" },
    {
      value: "demographics",
      label: "Demographics Report",
      description: "Focus on age, gender, education, and location",
    },
    {
      value: "business",
      label: "Business Analysis",
      description: "Challenges, opportunities, and value chain analysis",
    },
    { value: "technology", label: "Technology Adoption", description: "Technology usage and barriers analysis" },
    { value: "geographic", label: "Geographic Analysis", description: "Location-based insights and patterns" },
  ]

  const districts = ["Mpigi", "Masaka", "Butambala", "Mityana"]
  const genders = ["Male", "Female", "Other"]

  const generateReport = async (type?: string | React.MouseEvent<HTMLButtonElement>) => {
    const currentType = typeof type === "string" ? type : reportType
    if (!currentType) {
      alert("Please select a report type first.")
      return
    }

    if (reportRef.current) {
      const canvas = await html2canvas(reportRef.current)
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${currentType}-report.pdf`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
              <p className="text-sm text-gray-600">Generate and export detailed reports</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Report Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Report Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Report Type
                </CardTitle>
                <CardDescription>Choose the type of report you want to generate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reportTypes.map((type) => (
                  <div
                    key={type.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      reportType === type.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setReportType(type.value)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="reportType"
                        value={type.value}
                        checked={reportType === type.value}
                        onChange={() => setReportType(type.value)}
                        className="text-blue-600"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{type.label}</h3>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Customize your report with specific filters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* District Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Districts</label>
                  <div className="grid grid-cols-2 gap-3">
                    {districts.map((district) => (
                      <div key={district} className="flex items-center space-x-2">
                        <Checkbox
                          id={`district-${district}`}
                          checked={selectedDistricts.includes(district)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedDistricts([...selectedDistricts, district])
                            } else {
                              setSelectedDistricts(selectedDistricts.filter((d) => d !== district))
                            }
                          }}
                        />
                        <label htmlFor={`district-${district}`} className="text-sm text-gray-700">
                          {district}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gender Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Gender</label>
                  <div className="flex space-x-6">
                    {genders.map((gender) => (
                      <div key={gender} className="flex items-center space-x-2">
                        <Checkbox
                          id={`gender-${gender}`}
                          checked={selectedGenders.includes(gender)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedGenders([...selectedGenders, gender])
                            } else {
                              setSelectedGenders(selectedGenders.filter((g) => g !== gender))
                            }
                          }}
                        />
                        <label htmlFor={`gender-${gender}`} className="text-sm text-gray-700">
                          {gender}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Report Options */}
            <Card>
              <CardHeader>
                <CardTitle>Report Options</CardTitle>
                <CardDescription>Customize the content and format of your report</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-charts"
                    checked={includeCharts}
                    onCheckedChange={(checked) => setIncludeCharts(!!checked)}
                  />
                  <label htmlFor="include-charts" className="text-sm text-gray-700">
                    Include charts and visualizations
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-raw-data"
                    checked={includeRawData}
                    onCheckedChange={(checked) => setIncludeRawData(!!checked)}
                  />
                  <label htmlFor="include-raw-data" className="text-sm text-gray-700">
                    Include raw data tables
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Preview/Summary */}
          <div className="space-y-6">
            <div ref={reportRef} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Summary</CardTitle>
                  <CardDescription>Preview of your report configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Report Type</h4>
                    <p className="text-sm text-gray-600">
                      {reportTypes.find((t) => t.value === reportType)?.label || "Not selected"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Districts</h4>
                    <p className="text-sm text-gray-600">
                      {selectedDistricts.length > 0 ? selectedDistricts.join(", ") : "All districts"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Gender</h4>
                    <p className="text-sm text-gray-600">
                      {selectedGenders.length > 0 ? selectedGenders.join(", ") : "All genders"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Options</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {includeCharts && <li>• Charts included</li>}
                      {includeRawData && <li>• Raw data included</li>}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {includeCharts && (
                <Card>
                  <CardHeader>
                    <CardTitle>Selected Charts</CardTitle>
                    <CardDescription>Visual representation</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Reports</CardTitle>
                <CardDescription>Generate common reports quickly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => generateReport("analytics-summary")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics Summary
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => generateReport("respondent-list")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Respondent List
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => generateReport("geographic-report")}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Geographic Report
                </Button>
              </CardContent>
            </Card>

            <Button onClick={generateReport} disabled={!reportType} className="w-full" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
