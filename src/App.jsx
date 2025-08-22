import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { 
  Upload, 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  MapPin,
  Shield,
  Car,
  GraduationCap,
  Building,
  Clock,
  TrendingUp,
  Database,
  Zap
} from 'lucide-react'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedData, setParsedData] = useState(null)
  const [uploadStatus, setUploadStatus] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  // API Configuration - Fixed to use Railway URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://driveline-api-server-production.up.railway.app'
  
  // Debug logging
  console.log('API_BASE_URL:', API_BASE_URL)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'application/pdf') {
        setSelectedFile(file)
        setUploadStatus(`Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`)
      } else {
        setUploadStatus('Please select a PDF file')
      }
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === 'application/pdf') {
        setSelectedFile(file)
        setUploadStatus(`Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`)
      } else {
        setUploadStatus('Please select a PDF file')
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a PDF file first')
      return
    }

    setIsProcessing(true)
    setUploadStatus('Uploading and parsing PDF...')

    try {
      const formData = new FormData()
      formData.append('pdf_file', selectedFile)

      // Construct the API URL explicitly to avoid any issues
      const apiUrl = `${API_BASE_URL}/api/v2/parse`
      console.log('Making API call to:', apiUrl)

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('API Response:', result)
      
      if (!result.success) {
        throw new Error(result.message || 'PDF parsing failed')
      }

      setParsedData(result.data)
      setUploadStatus(`✅ PDF parsed successfully with ${result.data.parsing_confidence}% confidence`)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus(`❌ Error: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadCSV = () => {
    if (!parsedData) return

    // Prepare CSV data
    const csvData = []
    const headers = []
    const values = []

    // Add basic fields
    Object.keys(parsedData).forEach(key => {
      if (key !== 'raw_text' && key !== 'employment_history' && key !== 'accident_history' && key !== 'extraction_metadata') {
        headers.push(key)
        values.push(parsedData[key] || '')
      }
    })

    // Add employment history as separate columns
    if (parsedData.employment_history && parsedData.employment_history.length > 0) {
      parsedData.employment_history.forEach((job, index) => {
        Object.keys(job).forEach(jobKey => {
          headers.push(`employment_${index + 1}_${jobKey}`)
          values.push(job[jobKey] || '')
        })
      })
    }

    csvData.push(headers.join(','))
    csvData.push(values.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))

    // Create and download file
    const csvContent = csvData.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${parsedData.full_name || 'driver_application'}_parsed_data.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const getRiskLevel = () => {
    if (!parsedData) return null
    
    const hasIssues = parsedData.convicted_of_crime || 
                     parsedData.failed_drug_test || 
                     parsedData.accidents_last_5_years ||
                     parsedData.license_suspended_revoked

    const hasMinorIssues = parsedData.moving_violations_3_years

    if (hasIssues) return { level: 'high', color: 'destructive', icon: AlertCircle }
    if (hasMinorIssues) return { level: 'medium', color: 'warning', icon: AlertCircle }
    return { level: 'low', color: 'success', icon: CheckCircle }
  }

  const riskAssessment = getRiskLevel()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Driveline PDF Parser</h1>
                <p className="text-sm text-gray-600">Professional Driver Application Data Extraction</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Zap className="h-3 w-3 mr-1" />
                Enhanced v2.0
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Database className="h-3 w-3 mr-1" />
                91+ Fields
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload PDF</span>
                </CardTitle>
                <CardDescription>
                  Upload a Tenstreet driver application PDF for comprehensive data extraction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Drag and Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your PDF here
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    or click to browse files
                  </p>
                  <Button variant="outline" size="sm">
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* File Info */}
                {selectedFile && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-blue-900">{selectedFile.name}</p>
                        <p className="text-sm text-blue-600">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Parse PDF
                    </>
                  )}
                </Button>

                {/* Status */}
                {uploadStatus && (
                  <Alert className={uploadStatus.includes('✅') ? 'border-green-200 bg-green-50' : 
                                  uploadStatus.includes('❌') ? 'border-red-200 bg-red-50' : 
                                  'border-blue-200 bg-blue-50'}>
                    <AlertDescription>{uploadStatus}</AlertDescription>
                  </Alert>
                )}

                {/* Features List */}
                <div className="mt-6 space-y-2">
                  <h4 className="font-medium text-gray-900">Enhanced Features:</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Criminal record detection</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Accident history parsing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Employment history extraction</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>FMCSR compliance checking</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Traffic violation tracking</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {parsedData ? (
              <div className="space-y-6">
                {/* Summary Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <User className="h-5 w-5" />
                          <span>{parsedData.full_name || 'Driver Application'}</span>
                        </CardTitle>
                        <CardDescription>
                          Parsed with {parsedData.parsing_confidence}% confidence
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {riskAssessment && (
                          <Badge 
                            variant={riskAssessment.color === 'success' ? 'default' : 'destructive'}
                            className={
                              riskAssessment.level === 'low' ? 'bg-green-100 text-green-800 border-green-200' :
                              riskAssessment.level === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              'bg-red-100 text-red-800 border-red-200'
                            }
                          >
                            <riskAssessment.icon className="h-3 w-3 mr-1" />
                            {riskAssessment.level === 'low' ? 'Low Risk' :
                             riskAssessment.level === 'medium' ? 'Medium Risk' : 'High Risk'}
                          </Badge>
                        )}
                        <Button onClick={downloadCSV} variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download CSV
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-900">
                          {parsedData.parsing_confidence}%
                        </div>
                        <div className="text-sm text-blue-600">Confidence</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-900">
                          {parsedData.extraction_metadata?.fields_extracted || 0}
                        </div>
                        <div className="text-sm text-green-600">Fields Extracted</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Building className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-900">
                          {parsedData.employment_history?.length || 0}
                        </div>
                        <div className="text-sm text-purple-600">Employment Records</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Data Tabs */}
                <Card>
                  <CardContent className="p-0">
                    <Tabs defaultValue="personal" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="personal">Personal</TabsTrigger>
                        <TabsTrigger value="license">License</TabsTrigger>
                        <TabsTrigger value="safety">Safety</TabsTrigger>
                        <TabsTrigger value="employment">Employment</TabsTrigger>
                        <TabsTrigger value="compliance">Compliance</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="personal" className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Name:</span>
                              <span>{parsedData.full_name || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Email:</span>
                              <span>{parsedData.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Phone:</span>
                              <span>{parsedData.primary_phone || parsedData.cell_phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">DOB:</span>
                              <span>{parsedData.date_of_birth || 'N/A'}</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Address:</span>
                              <span>{parsedData.current_address || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">City/State:</span>
                              <span>{parsedData.city_state_zip || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Emergency Contact:</span>
                              <span>{parsedData.emergency_contact_name || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Emergency Phone:</span>
                              <span>{parsedData.emergency_contact_phone || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="license" className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Has CDL:</span>
                              <Badge variant={parsedData.has_cdl ? 'default' : 'secondary'}>
                                {parsedData.has_cdl ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">License Number:</span>
                              <span>{parsedData.license_number || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">License Class:</span>
                              <span>{parsedData.license_class || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">State:</span>
                              <span>{parsedData.licensing_authority || 'N/A'}</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Expiration:</span>
                              <span>{parsedData.license_expiration_date || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Medical Card Exp:</span>
                              <span>{parsedData.dot_medical_card_expiration || 'N/A'}</span>
                            </div>
                            <div className="space-y-2">
                              <span className="font-medium">Endorsements:</span>
                              <div className="flex flex-wrap gap-2">
                                {parsedData.tanker_endorsement && <Badge variant="outline">Tanker</Badge>}
                                {parsedData.hazmat_endorsement && <Badge variant="outline">Hazmat</Badge>}
                                {parsedData.x_endorsement && <Badge variant="outline">X</Badge>}
                                {parsedData.doubles_triples_endorsement && <Badge variant="outline">Doubles/Triples</Badge>}
                                {parsedData.passenger_endorsement && <Badge variant="outline">Passenger</Badge>}
                                {parsedData.school_bus_endorsement && <Badge variant="outline">School Bus</Badge>}
                                {!parsedData.tanker_endorsement && !parsedData.hazmat_endorsement && 
                                 !parsedData.x_endorsement && !parsedData.doubles_triples_endorsement &&
                                 !parsedData.passenger_endorsement && !parsedData.school_bus_endorsement && 
                                 <span className="text-gray-500">None</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="safety" className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-3">Criminal Record</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span>Convicted of Crime:</span>
                                <Badge variant={parsedData.convicted_of_crime ? 'destructive' : 'default'}>
                                  {parsedData.convicted_of_crime ? 'Yes' : 'No'}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Felony Convictions:</span>
                                <Badge variant={parsedData.felony_convictions ? 'destructive' : 'default'}>
                                  {parsedData.felony_convictions ? 'Yes' : 'No'}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Pending Charges:</span>
                                <Badge variant={parsedData.charges_pending ? 'destructive' : 'default'}>
                                  {parsedData.charges_pending ? 'Yes' : 'No'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-3">Safety Record</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span>Accidents (5 years):</span>
                                <Badge variant={parsedData.accidents_last_5_years ? 'destructive' : 'default'}>
                                  {parsedData.accidents_last_5_years ? 'Yes' : 'No'}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Failed Drug Test:</span>
                                <Badge variant={parsedData.failed_drug_test ? 'destructive' : 'default'}>
                                  {parsedData.failed_drug_test ? 'Yes' : 'No'}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>License Suspended:</span>
                                <Badge variant={parsedData.license_suspended_revoked ? 'destructive' : 'default'}>
                                  {parsedData.license_suspended_revoked ? 'Yes' : 'No'}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Moving Violations:</span>
                                <Badge variant={parsedData.moving_violations_3_years ? 'destructive' : 'default'}>
                                  {parsedData.moving_violations_3_years ? 'Yes' : 'No'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="employment" className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Employment History</h4>
                            <Badge variant="outline">
                              {parsedData.employment_history?.length || 0} Records
                            </Badge>
                          </div>
                          {parsedData.employment_history && parsedData.employment_history.length > 0 ? (
                            <div className="space-y-4">
                              {parsedData.employment_history.slice(0, 5).map((job, index) => (
                                <Card key={index} className="p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h5 className="font-medium">{job.company_name || 'Company Name N/A'}</h5>
                                      <p className="text-sm text-gray-600">{job.position_held || 'Position N/A'}</p>
                                      <p className="text-sm text-gray-500">
                                        {job.start_date || 'Start N/A'} - {job.end_date || 'End N/A'}
                                      </p>
                                    </div>
                                    <div className="text-sm">
                                      {job.reason_for_leaving && (
                                        <p><span className="font-medium">Reason for leaving:</span> {job.reason_for_leaving}</p>
                                      )}
                                      {job.may_contact !== null && (
                                        <p><span className="font-medium">May contact:</span> {job.may_contact ? 'Yes' : 'No'}</p>
                                      )}
                                      {job.operated_cmv !== null && (
                                        <p><span className="font-medium">Operated CMV:</span> {job.operated_cmv ? 'Yes' : 'No'}</p>
                                      )}
                                    </div>
                                  </div>
                                </Card>
                              ))}
                              {parsedData.employment_history.length > 5 && (
                                <p className="text-sm text-gray-500 text-center">
                                  And {parsedData.employment_history.length - 5} more records...
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-8">No employment history found</p>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="compliance" className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-3">FCRA Authorizations</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span>Background Check Auth:</span>
                                <Badge variant={parsedData.background_check_authorization ? 'default' : 'secondary'}>
                                  {parsedData.background_check_authorization ? 'Yes' : 'No'}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Employment Verification:</span>
                                <Badge variant={parsedData.employment_verification_authorization ? 'default' : 'secondary'}>
                                  {parsedData.employment_verification_authorization ? 'Yes' : 'No'}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Clearinghouse Release:</span>
                                <Badge variant={parsedData.clearinghouse_release ? 'default' : 'secondary'}>
                                  {parsedData.clearinghouse_release ? 'Yes' : 'No'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-3">Education</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span>Attended Trucking School:</span>
                                <Badge variant={parsedData.attended_trucking_school ? 'default' : 'secondary'}>
                                  {parsedData.attended_trucking_school ? 'Yes' : 'No'}
                                </Badge>
                              </div>
                              {parsedData.school_name && (
                                <div>
                                  <span className="font-medium">School:</span>
                                  <p className="text-sm">{parsedData.school_name}</p>
                                </div>
                              )}
                              {parsedData.graduation_status && (
                                <div>
                                  <span className="font-medium">Status:</span>
                                  <p className="text-sm">{parsedData.graduation_status}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No PDF Parsed Yet</h3>
                  <p className="text-gray-600">
                    Upload a Tenstreet driver application PDF to see comprehensive extracted data here
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              Driveline PDF Parser v2.0 - Enhanced with comprehensive data extraction
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Extracts 91+ fields including criminal history, safety records, and employment details
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

