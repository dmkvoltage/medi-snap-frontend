# MediSnap - Medical Document Translator

<div align="center">

**Transform Complex Medical Documents Into Plain Language**

A privacy-first, AI-powered Progressive Web Application that helps patients understand medical documents instantly using advanced computer vision and natural language processing.

[Live Demo](#) • [Backend Repo](#) • [Documentation](#) • [Report Bug](issues) • [Request Feature](issues)

</div>

---

## About MediSnap

MediSnap solves a critical healthcare problem: **medical jargon is confusing**. Patients often receive medical documents they don't understand, leading to:
- Anxiety and stress
- Poor adherence to medical advice
- Miscommunication with healthcare providers

MediSnap instantly translates complex medical terminology into clear, simple language while prioritizing **absolute privacy** - your medical documents are never stored or archived.

### Who Is This For?

- **Patients** receiving medical documentation who want clarity
- **Caregivers** helping elderly family members understand medical records
- **Healthcare Advocates** supporting vulnerable populations
- **Students** learning about medical interpretation systems

---

## 🎯 Features

### MVP Features (Phase 1)
- ✅ **Document Capture**: Camera capture and file upload (JPG, PNG, PDF)
- ✅ **AI-Powered Analysis**: Gemini 3 Pro Vision API integration
- ✅ **Plain Language Translation**: Medical jargon simplified to 8th-grade reading level
- ✅ **Interactive Results**: Tabbed interface with summary, details, terms, and actions
- ✅ **Mobile First**: Fully responsive design optimized for all devices
- ✅ **Privacy First**: Zero data persistence, auto-delete on page close
- ✅ **Accessibility**: WCAG 2.1 AA compliant with semantic HTML

### Enhanced Features (Phase 2)
- 🔄 **Multi-Language Support**: Spanish, Mandarin, French, Arabic, Hindi, Portuguese, Russian, German, Japanese, Korean
- 🔄 **Visual Highlighting**: Original document with highlighted sections
- 🔄 **Interactive Q&A**: Chat interface for follow-up questions

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with design tokens
- **UI Components**: shadcn/ui (50+ components)
- **HTTP Client**: Fetch API
- **Icons**: Lucide React
- **Code Quality**: ESLint + Prettier

### Key Dependencies
```json
{
  "next": "^16.0.0",
  "react": "^19.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^4.0.0",
  "lucide-react": "latest",
  "@hookform/resolvers": "latest",
  "react-hook-form": "latest"
}
```

## 📋 Prerequisites

- Node.js 18.17+ and npm/pnpm/yarn
- Backend API running (see Backend Setup)
- Modern web browser with:
  - Camera access support
  - File upload capability
  - HTTPS support (required for camera)

## How It Works - User Journey

```
┌─────────────────────────────────────────────────────────────┐
│  1. LANDING PAGE                                             │
│  Hero section with features • Click "Get Started Now"        │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  2. UPLOAD YOUR DOCUMENT                                     │
│  • Drag & Drop                                               │
│  • Click to browse files (JPG, PNG, PDF)                     │
│  • Use device camera (real-time)                             │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  3. AI PROCESSES DOCUMENT                                    │
│  Loading screen with progress (2-5 seconds)                 │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  4. VIEW RESULTS (4 Tabs)                                    │
│  • Summary: Plain language overview                          │
│  • Details: Original text + simplified sections              │
│  • Terms: Medical terminology with definitions               │
│  • Actions: Next steps & ask questions via chat              │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  5. OPTIONAL: ASK FOLLOW-UP QUESTIONS                        │
│  Click "Ask a Question" in Actions tab                       │
│  Chat interface for clarifications                           │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  6. ANALYZE ANOTHER DOCUMENT                                 │
│  Upload form appears at bottom of results                    │
│  Start new analysis immediately                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### For Users

1. Visit [MediSnap App](#)
2. Click "Get Started Now"
3. Upload your medical document (camera or file)
4. Click "Translate Document"
5. Review results in 4 tabs
6. Ask follow-up questions in the chat (optional)

### For Developers

#### 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd medisnap-frontend

# Install dependencies
npm install
# or
pnpm install
```

#### 2. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your backend API URL
# NEXT_PUBLIC_API_URL=http://localhost:8000/api  # Development
# NEXT_PUBLIC_API_URL=https://api.medisnap.app   # Production
```

#### 3. Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### 4. Production Build

```bash
npm run build
npm run start
```

## 📁 Project Structure

```
medisnap-frontend/
├── app/
│   ├── layout.tsx              # Root layout with metadata & fonts
│   ├── page.tsx                # Main app - state management & routing
│   └── globals.css             # Global styles & design tokens
│
├── components/
│   ├── header.tsx              # Navigation with language selector
│   ├── footer.tsx              # Privacy & legal links
│   ├── landing-section.tsx     # Hero, features, how-it-works
│   ├── document-upload.tsx     # File/camera upload with preview
│   ├── loading-state.tsx       # Progress indicator
│   ├── results-display.tsx     # 4-tab results interface
│   ├── chat-window.tsx         # Q&A interface
│   └── ui/                     # shadcn/ui components (50+)
│
├── lib/
│   ├── api-client.ts           # API calls & mock data
│   └── utils.ts                # Utility functions
│
├── public/                      # Static assets & images
├── .env.example                # Environment template
├── tailwind.config.js          # Tailwind CSS configuration
├── next.config.mjs             # Next.js optimization settings
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

### Key Component Relationships

```
page.tsx (Main Brain)
  ├─ Header (Language selector)
  ├─ LandingSection (Get Started button)
  │   └─ onGetStarted → triggers upload mode
  │
  ├─ DocumentUpload (Main: upload & preview)
  │   └─ onFileSelected → stores file & preview
  │
  ├─ LoadingState (Shows during processing)
  │
  ├─ ResultsDisplay (Main: shows 4 tabs)
  │   ├─ Summary Tab (Plain language overview)
  │   ├─ Details Tab (Original vs simplified)
  │   ├─ Terms Tab (Medical definitions)
  │   ├─ Actions Tab
  │   │   └─ ChatWindow (Ask questions)
  │   └─ DocumentUpload (Compact: upload another)
  │
  └─ Footer (Privacy & links)
```

**Data Flow:**
1. User uploads document → `page.tsx` state updates
2. Click translate → `api-client.ts` calls backend
3. Results received → `page.tsx` stores in state
4. `ResultsDisplay` renders with 4 tabs
5. Click "Ask Question" → `ChatWindow` appears
6. Chat visible → can ask follow-ups

## 🎨 Design System

### Color Palette
- **Primary**: Medical Blue (#0066CC, oklch(0.45 0.24 250))
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)
- **Neutral**: Slate grays with light/dark variants

### Typography
- **Headers**: Geist (bold)
- **Body**: Geist (regular)
- **Monospace**: Geist Mono
- **Min Font Size**: 16px (mobile), 14px (desktop)

### Responsive Breakpoints
- Mobile: 0px
- Tablet: 640px (sm)
- Desktop: 1024px (md, lg)
- Large: 1280px (xl)

## 🔒 Privacy & Security

### Data Handling
- **Zero Persistence**: No data stored on client or server
- **Client-Side Processing**: All validation and preprocessing locally
- **Temporary Cloud Storage**: Images stored for max 1 hour with auto-deletion
- **Session Cleanup**: Results cleared on tab close via beforeunload event
- **No localStorage**: Sensitive data never stored client-side

### Security Measures
- **HTTPS Only**: TLS 1.3+ for all communications
- **Input Validation**: File type and size validation
- **CORS**: Restricted to allowed origins
- **Environment Variables**: Secrets in .env.local (never committed)
- **CSP Headers**: Content Security Policy enforcement

## 🔌 API Integration

### Backend Requirements
The application expects a Django REST API with the following endpoints:

#### Interpretation Endpoint
```
POST /api/interpret/
Content-Type: multipart/form-data

Request:
- file: File (JPG, PNG, or PDF)

Response:
{
  "id": "string",
  "interpretation": {
    "summary": "string",
    "sections": [{
      "original": "string",
      "simplified": "string",
      "terms": [{
        "term": "string",
        "definition": "string",
        "importance": "high|medium|low"
      }]
    }],
    "warnings": ["string"],
    "nextSteps": ["string"]
  },
  "document_type": "string",
  "confidence": 0.0-1.0,
  "processingTime": number
}
```

#### Chat Endpoint
```
POST /api/chat/
Content-Type: application/json

Request:
{
  "session_id": "string",
  "question": "string"
}

Response:
{
  "answer": "string"
}
```

## 📱 Progressive Web App (PWA)

### Current Implementation
- Responsive design for all devices
- Mobile-first approach
- Camera access via MediaDevices API
- Touch-optimized interface

### Future PWA Enhancements
- Service Worker for offline support
- Web App Manifest
- Installation prompt
- Background sync

## ♿ Accessibility

- **WCAG 2.1 AA Compliant**
- Semantic HTML elements (`main`, `header`, `nav`, `article`)
- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- Color contrast ratios ≥ 4.5:1
- Focus indicators visible
- No keyboard traps

## 🧪 Testing

### Unit Tests (Jest)
```bash
npm run test
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
npm run format
```

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Deploy automatically on git push
npm install -g vercel
vercel
```

### Docker
```bash
# Build image
docker build -t medisnap-frontend .

# Run container
docker run -p 3000:3000 medisnap-frontend
```

### Self-Hosted
```bash
# Build production bundle
npm run build

# Start server
npm run start

# Or use process manager (PM2)
pm2 start npm --name "medisnap" -- start
```

### Environment Setup
1. Set `NEXT_PUBLIC_API_URL` to your backend domain
2. Configure CORS on backend to allow frontend origin
3. Enable HTTPS on both frontend and backend
4. Set up monitoring and error tracking

## 📊 Performance

### Optimization Techniques
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **CSS Optimization**: Tailwind CSS purging
- **Font Loading**: Google Fonts with display=swap
- **Lazy Loading**: Components loaded on-demand

### Core Web Vitals Target
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

## Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server on localhost:3000

# Production
npm run build            # Build production bundle
npm run start            # Run production server

# Quality
npm run lint             # Check code quality
npm run format           # Format code
npm run type-check       # Type checking

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run end-to-end tests
```

---

## Common Questions & Answers

**Q: How is my medical data kept private?**
A: We use a zero-persistence model - your documents are never stored on our servers. They're processed temporarily and deleted immediately after analysis. Results clear when you close the tab.

**Q: Can I use this offline?**
A: Currently, you need internet for document processing. Future versions will support offline mode via service workers.

**Q: What file formats are supported?**
A: JPG, PNG, and PDF files up to 10MB. Camera photos are captured in real-time.

**Q: Is this a replacement for medical advice?**
A: No. MediSnap helps you understand documents but is NOT a substitute for consulting healthcare providers.

**Q: Can I save or download my results?**
A: Yes! In the Results tab, use the Download button to save as a text file.

**Q: What languages are supported?**
A: 10 languages: English, Spanish, French, German, Italian, Portuguese, Japanese, Chinese, Korean, and Arabic. Select in the header.

**Q: How long does processing take?**
A: Typically 2-5 seconds depending on document complexity.

**Q: Where can I ask questions?**
A: Use the Chat feature in the Results page (Actions tab → "Ask a Question").

---

## 🐛 Troubleshooting

### Common Issues & Solutions

**Camera not working**
```
✓ Ensure you're using HTTPS (required for camera)
✓ Check browser permissions (allow camera access)
✓ Try refreshing the page
✓ Use a modern browser (Chrome, Firefox, Safari, Edge)
```

**API connection errors**
```
✓ Verify NEXT_PUBLIC_API_URL in .env.local
✓ Check if backend server is running
✓ Ensure CORS is configured on backend
✓ Test with: curl NEXT_PUBLIC_API_URL/health
```

**Colors look black and white**
```
✓ Run: npm run build
✓ Clear browser cache (Ctrl+Shift+Delete)
✓ Verify tailwind.config.js exists
✓ Check globals.css has @import 'tailwindcss'
```

**Upload button not responding**
```
✓ Check file size (max 10MB)
✓ Verify file format (JPG, PNG, PDF only)
✓ Open browser console for error messages
✓ Try uploading a different file
```

**Results not showing**
```
✓ Check browser console for errors (F12)
✓ Verify API is returning data
✓ Ensure backend is running
✓ Check NEXT_PUBLIC_API_URL is correct
```

**Build fails**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Styling looks broken**
```bash
# Rebuild Tailwind CSS
npm run build

# Or restart dev server
npm run dev
```

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [TypeScript](https://www.typescriptlang.org)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## ⚠️ Disclaimer

**MediSnap is not a substitute for professional medical advice.** Results are for informational purposes only. Always consult with a healthcare provider for medical concerns, diagnoses, and treatment decisions.

## 🚀 Roadmap

### Current (v1.0)
- [x] Document upload & camera capture
- [x] AI-powered interpretation
- [x] 4-tab results interface
- [x] Follow-up questions via chat
- [x] 10-language support
- [x] Mobile-first responsive design
- [x] Privacy-first zero storage

### Next (v1.1)
- [ ] Download results as PDF
- [ ] Email results to healthcare provider
- [ ] Bookmark frequently accessed documents
- [ ] Dark mode enhancements
- [ ] Batch document processing

### Future (v2.0)
- [ ] Service worker for offline support
- [ ] Progressive Web App (PWA) installation
- [ ] Background sync
- [ ] Document comparison tool
- [ ] Medical library/glossary
- [ ] Integration with health apps

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes
4. **Test** thoroughly: `npm run test && npm run lint`
5. **Commit**: `git commit -m 'Add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Open** a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Follow ESLint rules (run `npm run lint`)
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

This means you can:
- Use this project for personal/commercial purposes
- Modify and distribute
- Include in proprietary applications

---

## ⚖️ Legal & Disclaimer

**IMPORTANT - Please Read:**

MediSnap is NOT:
- A substitute for professional medical advice
- A diagnostic tool
- Licensed medical software
- FDA-approved or regulated

MediSnap IS:
- An educational tool
- A document interpretation aid
- A reading comprehension helper

**Always consult with qualified healthcare professionals for:**
- Medical diagnoses
- Treatment decisions
- Medication changes
- Emergency situations

By using MediSnap, you agree to these terms and understand the limitations.

---

## 📞 Support & Contact

### Get Help

- **Documentation**: Check [APP_FLOW_EXPLAINED.md](./APP_FLOW_EXPLAINED.md)
- **Issues**: [GitHub Issues](issues)
- **Discussions**: [GitHub Discussions](discussions)
- **Email**: support@medisnap.app

### Report Issues

When reporting issues, please include:
1. Browser & OS (e.g., Chrome on Windows)
2. Steps to reproduce
3. Expected vs actual behavior
4. Screenshots/videos if helpful

### Feature Requests

Have an idea? [Submit a feature request](issues)!

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org) & [React](https://react.dev)
- UI Components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide React](https://lucide.dev)
- Styling with [Tailwind CSS](https://tailwindcss.com)
- AI powered by Gemini Vision API

---

<div align="center">

**Made with care for better healthcare understanding**

[Back to top](#medisnap---medical-document-translator)

</div>
