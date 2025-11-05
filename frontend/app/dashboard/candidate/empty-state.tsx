import { Upload, Briefcase, Award } from 'lucide-react'
import Link from 'next/link'

export default function EmptyState() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-2xl px-4">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
            <Briefcase className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Your Dashboard!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Let's get you started on your job search journey. Here's what you can do:
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">1. Upload Resume</h3>
            <p className="text-sm text-gray-600">
              Upload your resume to get AI-powered parsing and job matches
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">2. Get Matched</h3>
            <p className="text-sm text-gray-600">
              Our AI will match you with relevant job opportunities
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">3. Practice</h3>
            <p className="text-sm text-gray-600">
              Take mock interviews to improve your skills
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Resume
          </button>
          <Link 
            href="/mock-interview" 
            className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition font-semibold"
          >
            Start Mock Interview
          </Link>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Upload your resume first to unlock personalized job matches and analytics!
          </p>
        </div>
      </div>
    </div>
  )
}
