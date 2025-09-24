// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        this.clearAuth();
        window.location.href = '/';
        throw new Error('Authentication required');
      }
      
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || 'Request failed');
    }
    return response.json();
  }

  // Authentication methods
  async register(userData: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: string;
    language: string;
    state?: string;
  }) {
    const response = await fetch(`${this.baseURL}/api/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    
    const data = await this.handleResponse<{
      access_token: string;
      token_type: string;
      expires_in: number;
      user: any;
    }>(response);
    
    this.setAuth(data.access_token, data.user);
    return data;
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password })
    });
    
    const data = await this.handleResponse<{
      access_token: string;
      token_type: string;
      expires_in: number;
      user: any;
    }>(response);
    
    this.setAuth(data.access_token, data.user);
    return data;
  }

  async sendOTP(phone: string) {
    const response = await fetch(`${this.baseURL}/api/auth/send-otp`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ phone })
    });
    
    return this.handleResponse<{ message: string; otp?: string }>(response);
  }

  async verifyOTP(phone: string, otp: string, name: string, role: string = 'learner') {
    const response = await fetch(`${this.baseURL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ phone, otp, name, role })
    });
    
    const data = await this.handleResponse<{
      access_token: string;
      token_type: string;
      expires_in: number;
      user: any;
    }>(response);
    
    this.setAuth(data.access_token, data.user);
    return data;
  }

  async getCurrentUser() {
    const response = await fetch(`${this.baseURL}/api/auth/me`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<any>(response);
  }

  async updateProfile(profileData: any) {
    const response = await fetch(`${this.baseURL}/api/auth/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    
    return this.handleResponse<any>(response);
  }

  async logout() {
    await fetch(`${this.baseURL}/api/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    
    this.clearAuth();
  }

  // Assessment methods
  async getAssessments(subject?: string, difficulty?: string) {
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    if (difficulty) params.append('difficulty', difficulty);
    
    const response = await fetch(`${this.baseURL}/api/assessments?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<any[]>(response);
  }

  async createAssessment(assessmentData: {
    title: string;
    description: string;
    type: string;
    difficulty: string;
    subject: string;
    duration_minutes: number;
  }) {
    const response = await fetch(`${this.baseURL}/api/assessments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(assessmentData)
    });
    
    return this.handleResponse<any>(response);
  }

  async getAssessment(assessmentId: string) {
    const response = await fetch(`${this.baseURL}/api/assessments/${assessmentId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<any>(response);
  }

  async submitAssessment(assessmentId: string, answers: Record<string, string>) {
    const response = await fetch(`${this.baseURL}/api/assessments/${assessmentId}/submit`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(answers)
    });
    
    return this.handleResponse<any>(response);
  }

  async getMyAssessmentResults() {
    const response = await fetch(`${this.baseURL}/api/assessments/results/my`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<any[]>(response);
  }

  // Roadmap methods
  async generateRoadmap(roadmapData: {
    title: string;
    target_role: string;
    current_level: string;
    target_level: string;
    user_preferences?: any;
  }) {
    const response = await fetch(`${this.baseURL}/api/roadmaps/generate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(roadmapData)
    });
    
    return this.handleResponse<any>(response);
  }

  async saveRoadmap(roadmapId: string) {
    const response = await fetch(`${this.baseURL}/api/roadmaps/save`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ roadmap_id: roadmapId })
    });
    
    return this.handleResponse<any>(response);
  }

  async getMyRoadmaps() {
    const response = await fetch(`${this.baseURL}/api/roadmaps`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<any[]>(response);
  }

  async getRoadmap(roadmapId: string) {
    const response = await fetch(`${this.baseURL}/api/roadmaps/${roadmapId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<any>(response);
  }

  async markRoadmapItemComplete(roadmapId: string, itemId: string) {
    const response = await fetch(`${this.baseURL}/api/roadmaps/${roadmapId}/items/${itemId}/complete`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<any>(response);
  }

  // Course methods
  async getCourses(level?: string, skills?: string) {
    const params = new URLSearchParams();
    if (level) params.append('level', level);
    if (skills) params.append('skills', skills);
    
    const response = await fetch(`${this.baseURL}/api/courses?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<any[]>(response);
  }

  async enrollInCourse(courseId: string) {
    const response = await fetch(`${this.baseURL}/api/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<any>(response);
  }

  async getMyCourses() {
    const response = await fetch(`${this.baseURL}/api/courses/my-courses`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<any[]>(response);
  }

  async getCourseRecommendations() {
    const response = await fetch(`${this.baseURL}/api/courses/recommendations`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<any[]>(response);
  }

  // Profile methods
  async getProfileSettings() {
    const response = await fetch(`${this.baseURL}/api/profile/settings`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<any>(response);
  }

  async updateProfileSettings(settingsData: any) {
    const response = await fetch(`${this.baseURL}/api/profile/settings`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(settingsData)
    });
    
    return this.handleResponse<any>(response);
  }

  async getProfileStats() {
    const response = await fetch(`${this.baseURL}/api/profile/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<any>(response);
  }

  async getAchievements() {
    const response = await fetch(`${this.baseURL}/api/profile/achievements`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<any[]>(response);
  }

  // Auth utilities
  setAuth(token: string, user: any) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  clearAuth() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  }
}

export const apiService = new ApiService();
export default apiService;