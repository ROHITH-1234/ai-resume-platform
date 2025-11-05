'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { 
  Brain, ArrowLeft, ArrowRight, CheckCircle, Loader2, 
  Clock, Award, TrendingUp, AlertCircle, Send 
} from 'lucide-react'
import Link from 'next/link'

interface Question {
  index: number
  question: string
  answer?: string
  aiEvaluation?: {
    accuracy: number
    clarity: number
    confidence: number
    feedback: string
    suggestions: string[]
  }
  answeredAt?: string
}

interface Interview {
  _id: string
  domain: string
  difficulty: string
  status: string
  questions: Question[]
  overallScore?: number
  strengths?: string[]
  weaknesses?: string[]
  improvementTips?: string[]
  duration?: number
  createdAt: string
  completedAt?: string
}

export default function MockInterviewSessionPage() {
  const { getToken } = useAuth()
  const router = useRouter()
  const params = useParams()
  const interviewId = params.id as string

  const [interview, setInterview] = useState<Interview | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    if (interviewId) {
      loadInterview()
    }
  }, [interviewId])

  const loadInterview = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      if (token) apiClient.setToken(token)

      const response = await apiClient.getMockInterview(interviewId)
      setInterview(response.data.interview)

      // Find first unanswered question
      const firstUnanswered = response.data.interview.questions.findIndex(
        (q: Question) => !q.answer
      )
      if (firstUnanswered !== -1) {
        setCurrentQuestionIndex(firstUnanswered)
      }
    } catch (error) {
      console.error('Failed to load interview:', error)
      alert('Failed to load interview. Redirecting...')
      router.push('/mock-interview')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      alert('Please enter your answer')
      return
    }

    try {
      setSubmitting(true)
      const token = await getToken()
      if (token) apiClient.setToken(token)

      const response = await apiClient.submitMockAnswer(
        interviewId,
        currentQuestionIndex,
        currentAnswer
      )

      // Update the interview with evaluation
      if (interview) {
        const updatedQuestions = [...interview.questions]
        updatedQuestions[currentQuestionIndex] = {
          ...updatedQuestions[currentQuestionIndex],
          answer: currentAnswer,
          aiEvaluation: response.data.evaluation,
          answeredAt: new Date().toISOString()
        }
        setInterview({ ...interview, questions: updatedQuestions })
      }

      setCurrentAnswer('')
      
      // Move to next question or show completion
      if (currentQuestionIndex < (interview?.questions.length || 0) - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      }
    } catch (error: any) {
      console.error('Failed to submit answer:', error)
      alert(error.response?.data?.error || 'Failed to submit answer')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCompleteInterview = async () => {
    if (!interview) return

    const answeredCount = interview.questions.filter(q => q.answer).length
    if (answeredCount === 0) {
      alert('Please answer at least one question before completing')
      return
    }

    try {
      setCompleting(true)
      const token = await getToken()
      if (token) apiClient.setToken(token)

      const response = await apiClient.completeMockInterview(interviewId)
      
      // Update interview with results
      setInterview({
        ...interview,
        status: 'completed',
        overallScore: response.data.overallScore,
        strengths: response.data.strengths,
        weaknesses: response.data.weaknesses,
        improvementTips: response.data.improvementTips,
        duration: response.data.duration,
        completedAt: new Date().toISOString()
      })
    } catch (error: any) {
      console.error('Failed to complete interview:', error)
      alert(error.response?.data?.error || 'Failed to complete interview')
    } finally {
      setCompleting(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    )
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Not Found</h2>
          <Link href="/mock-interview" className="text-purple-600 hover:underline">
            ← Back to Mock Interviews
          </Link>
        </div>
      </div>
    )
  }

  // Show results if interview is completed
  if (interview.status === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/mock-interview"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Mock Interviews
          </Link>

          {/* Overall Score */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
            <div className={`inline-flex items-center justify-center w-32 h-32 ${getScoreBgColor(interview.overallScore || 0)} rounded-full mb-6`}>
              <Award className={`w-16 h-16 ${getScoreColor(interview.overallScore || 0)}`} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Interview Completed!</h1>
            <p className="text-6xl font-bold text-purple-600 mb-4">{interview.overallScore}%</p>
            <p className="text-xl text-gray-600">
              Overall Performance Score
            </p>
            {interview.duration && (
              <p className="text-gray-500 mt-2 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Duration: {interview.duration} minutes
              </p>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Strengths */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {interview.strengths?.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {interview.weaknesses?.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-orange-600 mt-1">!</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Improvement Tips */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Improvement Tips
            </h3>
            <ul className="space-y-2">
              {interview.improvementTips?.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-blue-600 font-bold">{index + 1}.</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Question Details */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Question Breakdown</h3>
            {interview.questions.map((q, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6">
                <div className="mb-4">
                  <h4 className="font-bold text-gray-900 mb-2">Question {index + 1}</h4>
                  <p className="text-gray-700">{q.question}</p>
                </div>

                {q.answer && (
                  <>
                    <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Your Answer:</p>
                      <p className="text-gray-600">{q.answer}</p>
                    </div>

                    {q.aiEvaluation && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Accuracy</p>
                            <p className={`text-2xl font-bold ${getScoreColor(q.aiEvaluation.accuracy)}`}>
                              {q.aiEvaluation.accuracy}%
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Clarity</p>
                            <p className={`text-2xl font-bold ${getScoreColor(q.aiEvaluation.clarity)}`}>
                              {q.aiEvaluation.clarity}%
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Confidence</p>
                            <p className={`text-2xl font-bold ${getScoreColor(q.aiEvaluation.confidence)}`}>
                              {q.aiEvaluation.confidence}%
                            </p>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm font-semibold text-gray-700 mb-1">AI Feedback:</p>
                          <p className="text-gray-700">{q.aiEvaluation.feedback}</p>
                        </div>

                        {q.aiEvaluation.suggestions && q.aiEvaluation.suggestions.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Suggestions:</p>
                            <ul className="space-y-1">
                              {q.aiEvaluation.suggestions.map((suggestion, sIndex) => (
                                <li key={sIndex} className="text-gray-600 text-sm flex items-start gap-2">
                                  <span className="text-purple-600">•</span>
                                  <span>{suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {!q.answer && (
                  <p className="text-gray-500 italic">Not answered</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-4 justify-center">
            <Link
              href="/mock-interview"
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              Start New Interview
            </Link>
            <Link
              href="/dashboard"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // In-progress interview
  const currentQuestion = interview.questions[currentQuestionIndex]
  const answeredCount = interview.questions.filter(q => q.answer).length
  const progressPercent = (answeredCount / interview.questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/mock-interview"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit Interview
        </Link>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">
              {answeredCount} / {interview.questions.length} answered
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <span className="capitalize">{interview.domain} Interview</span>
            <span className="capitalize">{interview.difficulty} Level</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-6">
            <p className="text-sm font-semibold text-purple-600 mb-2">
              Question {currentQuestionIndex + 1} of {interview.questions.length}
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentQuestion.question}
            </h2>
          </div>

          {!currentQuestion.answer ? (
            <div>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !currentAnswer.trim()}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Answer
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-1">Your Answer:</p>
                <p className="text-gray-600">{currentQuestion.answer}</p>
              </div>

              {currentQuestion.aiEvaluation && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Accuracy</p>
                      <p className={`text-3xl font-bold ${getScoreColor(currentQuestion.aiEvaluation.accuracy)}`}>
                        {currentQuestion.aiEvaluation.accuracy}%
                      </p>
                    </div>
                    <div className="text-center bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Clarity</p>
                      <p className={`text-3xl font-bold ${getScoreColor(currentQuestion.aiEvaluation.clarity)}`}>
                        {currentQuestion.aiEvaluation.clarity}%
                      </p>
                    </div>
                    <div className="text-center bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Confidence</p>
                      <p className={`text-3xl font-bold ${getScoreColor(currentQuestion.aiEvaluation.confidence)}`}>
                        {currentQuestion.aiEvaluation.confidence}%
                      </p>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">AI Feedback:</p>
                    <p className="text-gray-700 mb-3">{currentQuestion.aiEvaluation.feedback}</p>
                    {currentQuestion.aiEvaluation.suggestions && currentQuestion.aiEvaluation.suggestions.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Suggestions:</p>
                        <ul className="space-y-1">
                          {currentQuestion.aiEvaluation.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-gray-600 text-sm flex items-start gap-2">
                              <span className="text-purple-600">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-4">
                {currentQuestionIndex < interview.questions.length - 1 && (
                  <button
                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold flex items-center justify-center gap-2"
                  >
                    Next Question
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Question Navigation */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <p className="text-sm font-semibold text-gray-700 mb-3">All Questions</p>
          <div className="flex gap-2 flex-wrap">
            {interview.questions.map((q, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-12 h-12 rounded-lg font-semibold transition ${
                  index === currentQuestionIndex
                    ? 'bg-purple-600 text-white'
                    : q.answer
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Complete Interview Button */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-700 mb-4">
            {answeredCount === interview.questions.length
              ? "You've answered all questions! Complete the interview to see your results."
              : `You've answered ${answeredCount} out of ${interview.questions.length} questions. You can complete the interview anytime.`}
          </p>
          <button
            onClick={handleCompleteInterview}
            disabled={completing || answeredCount === 0}
            className="w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center gap-2"
          >
            {completing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Generating Results...
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6" />
                Complete Interview & See Results
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
