# Med8id API Integration Guide

Complete documentation for integrating the Med8id Frontend with the backend API.

## Overview

The Med8id Frontend communicates with a Django REST API backend to process medical documents. This guide explains all API endpoints, request/response formats, and error handling.

## Base URL

```
Development:  http://localhost:8000/api
Production:   https://api.Med8id.app/api
```

Set via environment variable:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Authentication

Currently, the API does not require authentication (stateless design). All requests must:
- Include proper `Content-Type` headers
- Use HTTPS in production
- Validate file types and sizes on client-side

## API Endpoints

### 1. Document Interpretation

Uploads a document (image or PDF) and returns plain language interpretation.

**Endpoint**: `POST /api/interpret/`

**Content-Type**: `multipart/form-data`

#### Request

```bash
curl -X POST http://localhost:8000/api/interpret/ \
  -F "file=@document.pdf"
```

**JavaScript Example**:
```typescript
const formData = new FormData();
formData.append('file', file); // File object from input

const response = await fetch(`${API_BASE_URL}/interpret/`, {
  method: 'POST',
  body: formData,
});

const data = await response.json();
```

**Request Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | File | Yes | Medical document (JPG, PNG, PDF, max 10MB) |

#### Response (Success - 200)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "interpretation": {
    "summary": "This lab report shows your complete blood count results. All values are within normal ranges, indicating good overall health.",
    "sections": [
      {
        "original": "WBC 7.2 K/uL (4.5-11.0), RBC 4.8 M/uL (4.5-5.9), HGB 14.5 g/dL (13.5-17.5)",
        "simplified": "Your white blood cells, red blood cells, and hemoglobin levels are all healthy.",
        "terms": [
          {
            "term": "WBC (White Blood Cells)",
            "definition": "Cells in your immune system that fight infections and foreign invaders.",
            "importance": "high"
          },
          {
            "term": "RBC (Red Blood Cells)",
            "definition": "Cells that carry oxygen from your lungs to all parts of your body.",
            "importance": "high"
          },
          {
            "term": "Hemoglobin",
            "definition": "A protein inside red blood cells that carries oxygen.",
            "importance": "medium"
          }
        ]
      },
      {
        "original": "PLT 250 K/uL (150-400)",
        "simplified": "Your platelet count is normal, which means your blood can clot properly.",
        "terms": [
          {
            "term": "Platelets (PLT)",
            "definition": "Cells that help your blood clot when you have a cut or injury.",
            "importance": "high"
          }
        ]
      }
    ],
    "warnings": [
      "If you experience unusual bruising or bleeding, contact your doctor immediately.",
      "These results are from [date]. If ordered long ago, request updated tests."
    ],
    "nextSteps": [
      "Review these results with your primary care doctor",
      "Schedule a follow-up appointment if recommended",
      "Keep a copy for your health records"
    ]
  },
  "document_type": "Lab Results",
  "confidence": 0.92,
  "processingTime": 1250
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier for this interpretation session |
| interpretation | object | Detailed interpretation results |
| interpretation.summary | string | 2-3 sentence plain language summary |
| interpretation.sections | array | Breakdown of document sections |
| interpretation.sections[].original | string | Original medical text from document |
| interpretation.sections[].simplified | string | Plain language explanation |
| interpretation.sections[].terms | array | Medical terms found in this section |
| interpretation.sections[].terms[].term | string | The medical term |
| interpretation.sections[].terms[].definition | string | Plain language definition |
| interpretation.sections[].terms[].importance | enum | "high", "medium", or "low" |
| interpretation.warnings | array | Critical warnings or side effects |
| interpretation.nextSteps | array | Recommended actions for the patient |
| document_type | string | Classified document type (e.g., "Lab Results", "Prescription", "Discharge Summary") |
| confidence | number | 0-1 confidence score for the interpretation |
| processingTime | number | Time taken in milliseconds |

#### Response (Error - 400)

```json
{
  "error": "Invalid file type",
  "details": "Supported formats: JPG, PNG, PDF"
}
```

#### Response (Error - 413)

```json
{
  "error": "File too large",
  "details": "Maximum file size is 10MB"
}
```

#### Response (Error - 500)

```json
{
  "error": "Internal server error",
  "details": "Failed to process document. Please try again."
}
```

**Error Codes**:
| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad request | Check file format and size |
| 413 | Payload too large | Reduce file size to < 10MB |
| 415 | Unsupported media type | Use JPG, PNG, or PDF files |
| 429 | Rate limited | Wait before retrying |
| 500 | Server error | Retry or contact support |
| 503 | Service unavailable | Backend is down, try later |

### 2. Follow-up Questions (Optional)

Ask follow-up questions about the interpreted document.

**Endpoint**: `POST /api/chat/`

**Content-Type**: `application/json`

#### Request

```typescript
const response = await fetch(`${API_BASE_URL}/chat/`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    session_id: 'interpretation-uuid',
    question: 'What does hemoglobin mean?',
  }),
});

const data = await response.json();
```

**Request Body**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "question": "What does hemoglobin mean and why is it important?"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| session_id | string (UUID) | Yes | The ID from the interpretation response |
| question | string | Yes | Follow-up question about the document |

#### Response (Success - 200)

```json
{
  "answer": "Hemoglobin is a protein in your red blood cells that carries oxygen. It's important because your body needs oxygen to function. Normal hemoglobin levels indicate your body is getting enough oxygen."
}
```

| Field | Type | Description |
|-------|------|-------------|
| answer | string | Plain language answer to the question |

#### Response (Error)

Same error format as `/interpret/` endpoint.

**Limitations**:
- Maximum 10 follow-up questions per session
- Rate limited: 1 question per 10 seconds
- Session expires after 30 minutes of inactivity

## Frontend API Client

The frontend includes a built-in API client (`lib/api-client.ts`) that handles all API communication.

### Usage

```typescript
import { interpretDocument, askQuestion, validateFile } from '@/lib/api-client';

// Validate file before upload
const validation = validateFile(file);
if (!validation.valid) {
  console.error(validation.error);
  return;
}

// Upload and interpret document
try {
  const results = await interpretDocument(file);
  console.log('Interpretation:', results);
} catch (error) {
  console.error('Error:', error.message);
}

// Ask follow-up question
try {
  const response = await askQuestion(results.id, 'What should I do?');
  console.log('Answer:', response.answer);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Client-Side Validation

The frontend validates files before sending to backend:

```typescript
function validateFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File exceeds 10MB' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Unsupported file type' };
  }

  return { valid: true };
}
```

## CORS Configuration (Backend)

The backend must configure CORS to allow requests from the frontend:

```python
# Django settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",        # Development
    "http://localhost:3001",        # Alternative dev port
    "https://Med8id.app",         # Production
    "https://www.Med8id.app",     # Production with www
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

CORS_EXPOSE_HEADERS = [
    "content-type",
    "x-total-count",
]
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

```
- Document Interpretation: 10 requests per minute per IP
- Follow-up Questions: 100 questions per hour per IP
```

When rate limited, the API returns:

```json
{
  "error": "Rate limit exceeded",
  "details": "Please wait before making another request",
  "retry_after": 60
}
```

Status Code: `429 Too Many Requests`

Header: `Retry-After: 60` (seconds)

## Error Handling

### Network Errors

Handle network failures gracefully:

```typescript
try {
  const response = await interpretDocument(file);
} catch (error) {
  if (error instanceof TypeError) {
    // Network error (no internet, CORS failure, etc.)
    console.error('Network error:', error.message);
  } else if (error instanceof Error) {
    // API error
    console.error('API error:', error.message);
  }
}
```

### Abort Requests

Cancel requests when needed:

```typescript
const controller = new AbortController();

try {
  const response = await interpretDocument(file, controller.signal);
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request was cancelled');
  }
}

// Cancel request after 30 seconds
setTimeout(() => controller.abort(), 30000);
```

## Security Considerations

### Client-Side Security

1. **Input Validation**: Validate file type and size before upload
2. **HTTPS Only**: Always use HTTPS in production
3. **CORS**: Backend must validate origin headers
4. **No Sensitive Data**: Don't send API keys from frontend

### Backend Security

1. **File Scanning**: Scan uploaded files for malware
2. **Size Limits**: Enforce maximum file size (10MB)
3. **Type Validation**: Verify file MIME types
4. **Rate Limiting**: Prevent abuse with rate limits
5. **HTTPS**: Force HTTPS only connections
6. **CORS**: Restrict to known origins
7. **Auto-Delete**: Clean up files after 1 hour

## Testing

### Mock API for Development

The frontend includes mock responses for testing without a backend:

```typescript
// In app/page.tsx, if API fails, mock data is returned
const mockResponse: InterpretationResponse = {
  id: 'mock-' + Date.now(),
  document_type: 'Lab Results',
  confidence: 0.92,
  // ... mock data
};
```

### API Testing Tools

#### Using curl
```bash
# Test interpretation endpoint
curl -X POST http://localhost:8000/api/interpret/ \
  -F "file=@test-document.pdf"

# Test chat endpoint
curl -X POST http://localhost:8000/api/chat/ \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "question": "What does this mean?"
  }'
```

#### Using Postman
1. Create new POST request to `http://localhost:8000/api/interpret/`
2. Set content type to `multipart/form-data`
3. Add file parameter
4. Send request

#### Using Python
```python
import requests

# Upload document
with open('document.pdf', 'rb') as f:
    files = {'file': f}
    response = requests.post(
        'http://localhost:8000/api/interpret/',
        files=files
    )

print(response.json())
```

## Performance Tips

### File Upload Optimization

1. **Compress Images**: Reduce image size before upload
2. **Choose Format**: PDF is fastest, then PNG, then JPG
3. **Check Size**: Aim for < 2MB file size
4. **Good Lighting**: Better image quality = faster processing

### Request Optimization

1. **Batch Questions**: Ask multiple questions in fewer calls
2. **Cache Results**: Don't re-request same document
3. **Abort Old Requests**: Cancel if user navigates away
4. **Retry Logic**: Implement exponential backoff

## Changelog

### v1.0 (Current)
- ✅ Document interpretation endpoint
- ✅ File upload support (JPG, PNG, PDF)
- ✅ Follow-up questions endpoint
- ✅ Rate limiting
- ✅ CORS support
- 🔄 Multi-language support (coming)
- 🔄 Visual highlighting (coming)

## Support

For API issues:
1. Check this documentation
2. Review error messages carefully
3. Test with curl or Postman
4. Check backend logs
5. Contact support@Med8id.app

---

**Last Updated**: January 2026
**API Version**: 1.0
**Status**: Production Ready
