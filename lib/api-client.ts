/**
 * API Client Configuration
 * Handles all communication with the backend
 */

export interface InterpretationResponse {
  id: string;
  interpretation: {
    summary: string;
    sections: Array<{
      original: string;
      simplified: string;
      terms: Array<{
        term: string;
        definition: string;
        importance: 'high' | 'medium' | 'low';
      }>;
    }>;
    medicalTerms?: string[];
    warnings: string[];
    nextSteps: string[];
  };
  document_type: string;
  confidence: number;
  processingTime: number;
  created_at?: string; // Added
}

export interface ApiError {
  error: string;
  details?: string;
  statusCode: number;
}

export interface ApiEnvelope<T> {
  erc: number;
  msg: string;
  total: number | null;
  next: string | null;
  data: T;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Upload document and get interpretation
 */
export async function interpretDocument(
  file: File,
  language: string = 'en',
  signal?: AbortSignal
): Promise<InterpretationResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);

  try {
    const response = await fetch(`${API_BASE_URL}/interpret/`, {
      method: 'POST',
      headers: getHeaders(), // Add auth headers
      body: formData,
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as InterpretationResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to interpret document: ${error.message}`);
    }
    throw new Error('Failed to interpret document: Unknown error');
  }
}

/**
 * Send follow-up question about interpretation
 */
export async function askQuestion(
  questionId: string,
  question: string,
  language: string = 'en',
  signal?: AbortSignal
): Promise<{ answer: string }> {
  console.log('[API] askQuestion called with:', { questionId, question, language });
  
  try {
    const requestBody = {
      session_id: questionId,
      question,
      language,
    };
    console.log('[API] Request body:', requestBody);
    
    const response = await fetch(`${API_BASE_URL}/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getHeaders(),
      },
      body: JSON.stringify(requestBody),
      signal,
    });

    console.log('[API] Response status:', response.status);
    console.log('[API] Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[API] Error response:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[API] Response data:', data);
    console.log('[API] Data type:', typeof data);
    console.log('[API] Data keys:', Object.keys(data));
    
    return data as { answer: string };
  } catch (error) {
    console.error('[API] Chat request failed:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to ask question: ${error.message}`);
    }
    throw new Error('Failed to ask question: Unknown error');
  }
}

/**
 * Get chat history for an interpretation
 */
export async function getChatHistory(
  interpretationId: string,
  signal?: AbortSignal
): Promise<{ messages: Array<{ id: string; role: string; content: string; created_at: string }> }> {
  console.log('[API] getChatHistory called for:', interpretationId);
  
  try {
    const response = await fetch(`${API_BASE_URL}/chat/${interpretationId}`, {
      method: 'GET',
      headers: getHeaders(),
      signal,
    });

    console.log('[API] Chat history response status:', response.status);
    console.log('[API] Chat history response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[API] Chat history error response:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[API] Chat history data:', data);
    console.log('[API] Chat history messages count:', data.messages?.length || 0);
    
    return data as { messages: Array<{ id: string; role: string; content: string; created_at: string }> };
  } catch (error) {
    console.error('[API] Chat history request failed:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch chat history: ${error.message}`);
    }
    throw new Error('Failed to fetch chat history: Unknown error');
  }
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload JPG, PNG, or PDF files.',
    };
  }

  return { valid: true };
}

// === NEW AUTH & DASHBOARD FUNCTIONS ===

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
  return response.json();
}

export async function registerUser(email: string, password: string, fullName: string) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }
  return response.json();
}

export async function getInterpretations(params: { type?: string; search?: string; page?: number; limit?: number } = {}) {
  const searchParams = new URLSearchParams();
  if (params.type) searchParams.append('type', params.type);
  if (params.search) searchParams.append('search', params.search);
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());

  const response = await fetch(`${API_BASE_URL}/interpret?${searchParams.toString()}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch interpretations');
  return response.json();
}

export async function getInterpretation(id: string): Promise<InterpretationResponse> {
  const response = await fetch(`${API_BASE_URL}/interpret/${id}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch interpretation');
  return response.json();
}

export async function deleteInterpretation(id: string) {
  const response = await fetch(`${API_BASE_URL}/interpret/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete');
  return response.json();
}

export function getExportUrl(id: string, format: 'pdf' | 'csv' | 'excel') {
  return `${API_BASE_URL}/interpret/${id}/export/${format}`;
}

export async function downloadExport(id: string, format: 'pdf' | 'csv' | 'excel') {
  const response = await fetch(`${API_BASE_URL}/interpret/${id}/export/${format}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Download failed');
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const ext = format === 'excel' ? 'xlsx' : format;
  a.download = `interpretation-${id}.${ext}`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
