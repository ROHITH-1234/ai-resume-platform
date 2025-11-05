'use client'

import { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function ResumeUploadPage() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [existingResume, setExistingResume] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [resumeId, setResumeId] = useState<string | null>(null)

  useEffect(() => {
    checkExistingResume()
  }, [])

  const checkExistingResume = async () => {
    try {
      const token = await getToken()
      if (token) {
        apiClient.setToken(token)
        const response = await apiClient.getMyResumes()
        if (response.data.resumes && response.data.resumes.length > 0) {
          const latest = response.data.resumes[0]
          setExistingResume(latest)
        }
      }
    } catch (error) {
      console.error('Error checking resume:', error)
    } finally {
      setLoading(false)
    }
  }

  const startProgressSimulation = () => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      if (progress <= 90) {
        setProcessingProgress(progress)
        setEstimatedTime(Math.max(0, 20 - Math.floor(progress / 5)))
      } else {
        clearInterval(interval)
      }
    }, 1000)
  }

  const pollResumeStatus = async (id: string) => {
    let attempts = 0
    const maxAttempts = 30 // 30 seconds max
    
    const poll = setInterval(async () => {
      try {
        attempts++
        const token = await getToken()
        if (token) {
          apiClient.setToken(token)
          const statusResponse = await apiClient.getResumeStatus(id)
          
          if (statusResponse.data.status === 'completed') {
            clearInterval(poll)
            setProcessing(false)
            setProcessingProgress(100)
            setEstimatedTime(0)
            setMessage('Resume parsed successfully! Finding job matches...')
            
            setTimeout(() => {
              router.push('/matches')
            }, 2000)
          } else if (statusResponse.data.status === 'failed') {
            clearInterval(poll)
            setProcessing(false)
            setStatus('error')
            const errorDetail = statusResponse.data.error || 'Unknown error occurred'
            setMessage(`Failed to parse resume: ${errorDetail}. Please try uploading again.`)
            setUploading(false)
          }
        }
        
        if (attempts >= maxAttempts) {
          clearInterval(poll)
          setProcessing(false)
          setMessage('Processing is taking longer than expected. Please check your matches page.')
          setTimeout(() => {
            router.push('/matches')
          }, 3000)
        }
      } catch (error) {
        console.error('Status check error:', error)
      }
    }, 1000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
      if (!validTypes.includes(selectedFile.type)) {
        setStatus('error')
        setMessage('Please upload a PDF or DOC/DOCX file')
        return
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setStatus('error')
        setMessage('File size must be less than 5MB')
        return
      }
      setFile(selectedFile)
      setStatus('idle')
      setMessage('')
    }
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploading(true)
      setStatus('idle')

      // Get authentication token
      const token = await getToken()
      if (!token) {
        setStatus('error')
        setMessage('Authentication required. Please sign in again.')
        setUploading(false)
        return
      }

      // Set token for API client
      apiClient.setToken(token)

      const formData = new FormData()
      formData.append('resume', file)
      formData.append('candidateId', user?.id || '')

      console.log('Uploading resume...', {
        fileName: file.name,
        fileSize: file.size,
        candidateId: user?.id
      })

      const response = await apiClient.uploadResume(formData)
      
      console.log('Upload response:', response.data)
      
      setStatus('success')
      setMessage('Resume uploaded successfully! AI is parsing your resume...')
      setResumeId(response.data.resumeId)
      
      // Start processing indicator
      setProcessing(true)
      setEstimatedTime(20) // 20 seconds estimate
      startProgressSimulation()
      
      // Poll for status
      pollResumeStatus(response.data.resumeId)
    } catch (error: any) {
      console.error('Upload error:', error)
      setStatus('error')
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to upload resume. Please try again.'
      setMessage(errorMsg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Your Resume</h1>
          <p className="text-lg text-gray-600">
            Upload your resume and let our AI analyze it to find the best job matches
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Existing Resume Section */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">Checking for existing resume...</p>
            </div>
          ) : existingResume ? (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Resume Already Uploaded!</h3>
                  <p className="text-gray-700 mb-3">
                    Your resume is active and being used for job matching.
                  </p>
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">{existingResume.originalFileName}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Status: <span className={`font-semibold ${existingResume.parseStatus === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                        {existingResume.parseStatus === 'completed' ? '✅ Parsed Successfully' : '⏳ Processing...'}
                      </span></p>
                      <p>Uploaded: {new Date(existingResume.createdAt).toLocaleString()}</p>
                      {existingResume.parsedData?.name && (
                        <p>Name: <span className="font-medium">{existingResume.parsedData.name}</span></p>
                      )}
                      {existingResume.parsedData?.skills && existingResume.parsedData.skills.length > 0 && (
                        <p>Skills Found: <span className="font-medium">{existingResume.parsedData.skills.length} skills</span></p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push('/matches')}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      View My Matches
                    </button>
                    <button
                      onClick={() => router.push('/dashboard/candidate')}
                      className="bg-white border-2 border-green-600 text-green-600 px-6 py-2 rounded-lg hover:bg-green-50 transition font-medium"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-sm text-gray-600 mb-2">Want to upload a new resume?</p>
                <p className="text-xs text-gray-500">Uploading a new resume will replace your existing one.</p>
              </div>
            </div>
          ) : null}

          {/* Upload Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition ${
                file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <div className="flex flex-col items-center">
                {file ? (
                  <>
                    <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                    <label className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                      Choose different file
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <Upload className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      Drag & drop your resume here
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      or click to browse
                    </p>
                    <label className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium">
                      Browse Files
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-4">
                      Supported formats: PDF, DOC, DOCX (Max 5MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Status Messages */}
            {status === 'success' && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">Success!</p>
                  <p className="text-sm text-green-700">{message}</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-700">{message}</p>
                </div>
              </div>
            )}

            {/* Processing Progress */}
            {processing && (
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Processing Your Resume</h4>
                    <p className="text-sm text-gray-600">AI is analyzing your experience and skills...</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{processingProgress}%</div>
                    <div className="text-xs text-gray-500">
                      {estimatedTime > 0 ? `~${estimatedTime}s remaining` : 'Almost done...'}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
                
                {/* Processing Steps */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div className={`flex items-center gap-1 ${processingProgress >= 30 ? 'text-green-600' : 'text-gray-400'}`}>
                    {processingProgress >= 30 ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border-2 border-current" />}
                    <span>Text Extraction</span>
                  </div>
                  <div className={`flex items-center gap-1 ${processingProgress >= 60 ? 'text-green-600' : 'text-gray-400'}`}>
                    {processingProgress >= 60 ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border-2 border-current" />}
                    <span>AI Analysis</span>
                  </div>
                  <div className={`flex items-center gap-1 ${processingProgress >= 90 ? 'text-green-600' : 'text-gray-400'}`}>
                    {processingProgress >= 90 ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border-2 border-current" />}
                    <span>Job Matching</span>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading || processing}
              className="w-full mt-6 bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-2"
            >
              {uploading || processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {processing ? 'Processing...' : 'Uploading...'}
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload Resume
                </>
              )}
            </button>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">AI Parsing</h3>
                  <p className="text-xs text-gray-600">
                    Our AI extracts skills, experience, and education
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Job Matching</h3>
                  <p className="text-xs text-gray-600">
                    Get matched with relevant jobs automatically
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">AI Suggestions</h3>
                  <p className="text-xs text-gray-600">
                    Get tips to improve your resume
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
