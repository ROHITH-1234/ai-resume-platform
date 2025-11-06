import axios, { AxiosInstance } from 'axios';

class ApiClient {
  private client: AxiosInstance;
  private tokenProvider: (() => Promise<string | null>) | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        try {
          // Try to get token from provider first (Clerk session)
          if (this.tokenProvider) {
            const token = await this.tokenProvider();
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
              return config;
            }
          }
          
          // Fallback to localStorage
          const token = this.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.warn('Failed to get auth token:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          console.error('API Error:', {
            status: error.response.status,
            data: error.response.data,
            url: error.config?.url
          });
        } else if (error.request) {
          console.error('Network Error: No response received', error.message);
        } else {
          console.error('Request Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  // Set token provider (for Clerk integration)
  setTokenProvider(provider: () => Promise<string | null>) {
    this.tokenProvider = provider;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('clerk-token');
    }
    return null;
  }

  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('clerk-token', token);
    }
  }

  // Auth
  async syncRole(userId: string, role: string) {
    return this.client.post('/auth/sync-role', { userId, role });
  }

  async syncMyRole(role: string) {
    return this.client.post('/auth/sync-role/me', { role });
  }

  async getMe() {
    return this.client.get('/auth/me');
  }

  // Resumes
  async uploadResume(formData: FormData) {
    return this.client.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async getResumeStatus(resumeId: string) {
    return this.client.get(`/resumes/${resumeId}/status`);
  }

  async getMyResumes() {
    return this.client.get('/resumes/my-resumes');
  }

  // Jobs
  async createJob(jobData: any) {
    return this.client.post('/jobs', jobData);
  }

  async getJobs(params?: any) {
    return this.client.get('/jobs', { params });
  }

  async getRecruiterJobs(params?: any) {
    return this.client.get('/jobs', { params });
  }

  async getJob(jobId: string) {
    return this.client.get(`/jobs/${jobId}`);
  }

  async updateJob(jobId: string, data: any) {
    return this.client.put(`/jobs/${jobId}`, data);
  }

  async deleteJob(jobId: string) {
    return this.client.delete(`/jobs/${jobId}`);
  }

  // Matches
  async getCandidateMatches(params?: any) {
    return this.client.get('/matches/candidate', { params });
  }

  async getAllMatches(params?: any) {
    return this.client.get('/matches', { params });
  }

  async getJobMatches(jobId: string, params?: any) {
    return this.client.get(`/matches/job/${jobId}`, { params });
  }

  async triggerCandidateMatching() {
    return this.client.post('/matches/candidate/trigger');
  }

  async triggerJobMatching(jobId: string) {
    return this.client.post(`/matches/job/${jobId}/trigger`);
  }

  async updateMatchStatus(matchId: string, status: string, notes?: string) {
    return this.client.patch(`/matches/${matchId}/status`, { status, notes });
  }

  async expressInterest(matchId: string, interested: boolean) {
    return this.client.patch(`/matches/${matchId}/interest`, { interested });
  }

  async createManualMatch(candidateId: string, jobId: string) {
    return this.client.post('/matches/manual', { candidateId, jobId });
  }

  // Interviews
  async scheduleInterview(data: any) {
    return this.client.post('/interviews', data);
  }

  async getInterviews(params?: any) {
    return this.client.get('/interviews', { params });
  }

  async getInterview(interviewId: string) {
    return this.client.get(`/interviews/${interviewId}`);
  }

  async updateInterviewStatus(interviewId: string, status: string) {
    return this.client.patch(`/interviews/${interviewId}/status`, { status });
  }

  async submitInterviewFeedback(interviewId: string, feedback: any) {
    return this.client.post(`/interviews/${interviewId}/feedback`, feedback);
  }

  async rescheduleInterview(interviewId: string, scheduledDateTime: string) {
    return this.client.patch(`/interviews/${interviewId}/reschedule`, { scheduledDateTime });
  }

  // Mock Interviews
  async startMockInterview(domain: string, difficulty: string) {
    return this.client.post('/mock-interviews/start', { domain, difficulty });
  }

  async submitMockAnswer(interviewId: string, questionIndex: number, answer: string) {
    return this.client.post(`/mock-interviews/${interviewId}/answer`, { questionIndex, answer });
  }

  async completeMockInterview(interviewId: string) {
    return this.client.post(`/mock-interviews/${interviewId}/complete`);
  }

  async getMyMockInterviews() {
    return this.client.get('/mock-interviews/my-interviews');
  }

  async getMockInterview(interviewId: string) {
    return this.client.get(`/mock-interviews/${interviewId}`);
  }

  // Chat
  async getChats() {
    return this.client.get('/chat');
  }

  async getChatForMatch(matchId: string) {
    return this.client.post(`/chat/match/${matchId}`);
  }

  async getChatMessages(chatId: string) {
    return this.client.get(`/chat/${chatId}/messages`);
  }

  async sendMessage(chatId: string, content: string) {
    return this.client.post(`/chat/${chatId}/messages`, { content });
  }

  async archiveChat(chatId: string) {
    return this.client.patch(`/chat/${chatId}/archive`);
  }

  // Analytics
  async getRecruiterAnalytics() {
    return this.client.get('/analytics/recruiter');
  }

  async getCandidateAnalytics() {
    return this.client.get('/analytics/candidate');
  }

  async getAdminAnalytics() {
    return this.client.get('/analytics/admin');
  }

  // Candidates
  async getCandidateProfile() {
    return this.client.get('/candidates/me');
  }

  // Helper method for generic GET/POST
  async get(url: string, params?: any) {
    return this.client.get(url, { params });
  }

  async post(url: string, data?: any) {
    return this.client.post(url, data);
  }
}

export const apiClient = new ApiClient();
