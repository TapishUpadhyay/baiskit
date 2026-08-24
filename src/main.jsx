// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )





import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 🎨 1. Developer Tools Console Branding (Linear / Stripe Style)
if (import.meta.env.DEV) {
  console.log(
    '%c 🛍️ BAISKIT %c v1.0.0 • Hyper-local Marketplace Ready ',
    'background: #6366F1; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 4px 8px; border-radius: 6px 0 0 6px;',
    'background: #0F172A; color: #A5B4FC; font-weight: 600; font-size: 11px; padding: 4px 8px; border-radius: 0 6px 6px 0;'
  )
}

// 🛡️ 2. Aesthetic Glassmorphic Error Fallback (Prevents Blank White Screens)
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 font-sans text-slate-100">
          <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-2xl p-7 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-3xl text-rose-500 border border-rose-500/20">
              ⚠️
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">Something went off track</h2>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              We encountered a minor glitch loading the storefront view.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all active:scale-95"
            >
              <span>Reload Application</span>
              <span>🔄</span>
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// 🚀 3. Safe Root Mounting
const rootElement = document.getElementById('root')

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  )
}