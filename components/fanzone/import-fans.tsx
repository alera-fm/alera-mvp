
"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface ImportResult {
  total: number
  successful: number
  failed: number
  errors: string[]
}

interface ImportFansProps {
  onImportComplete: () => void
}

export function ImportFans({ onImportComplete }: ImportFansProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Error",
          description: "Please select a CSV file",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/fanzone/import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data.results)
        
        if (data.results.successful > 0) {
          toast({
            title: "Import Complete",
            description: `Successfully imported ${data.results.successful} fans`,
          })
          onImportComplete()
        }
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = [
      'name,email,phone_number,country,gender,age,birth_year,subscribed_status,source',
      'John Doe,john@example.com,+1234567890,US,male,25,1998,free,import',
      'Jane Smith,jane@example.com,,UK,female,30,1993,paid,import'
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fan_import_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Fans from CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Download */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  Need a template?
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Download our CSV template with the correct format and example data
                </p>
              </div>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>

          {/* CSV Requirements */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>CSV Requirements:</strong>
              <ul className="mt-2 ml-4 list-disc text-sm">
                <li><strong>Required columns:</strong> name, email</li>
                <li><strong>Optional columns:</strong> phone_number, country, gender, age, birth_year, subscribed_status, source</li>
                <li>Email addresses must be unique per artist</li>
                <li>subscribed_status should be "free" or "paid" (defaults to "free")</li>
                <li>source will be set to "import" automatically</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={importing}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Import Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleImport} 
              disabled={!file || importing}
              className="w-full sm:w-auto"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Fans
                </>
              )}
            </Button>
          </div>

          {/* Import Progress */}
          {importing && (
            <div className="space-y-2">
              <Label>Import Progress</Label>
              <Progress value={50} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Processing your CSV file...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.successful > 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold">{result.total}</div>
                <div className="text-sm text-muted-foreground">Total Rows</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.successful}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Successful</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                <div className="text-sm text-red-700 dark:text-red-300">Failed</div>
              </div>
            </div>

            {/* Errors */}
            {result.errors.length > 0 && (
              <div>
                <Label className="text-red-600">Errors</Label>
                <div className="max-h-40 overflow-y-auto border rounded-lg p-2 bg-red-50 dark:bg-red-950">
                  {result.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700 dark:text-red-300 py-1">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Message */}
            {result.successful > 0 && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Successfully imported {result.successful} fans. They are now available in your fan list.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
