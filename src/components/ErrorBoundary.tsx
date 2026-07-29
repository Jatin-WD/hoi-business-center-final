import { Component, type ErrorInfo, type ReactNode } from "react"
import { Link } from "wouter"

interface State {
  hasError: boolean
  errorMessage: string | null
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = {
      hasError: false,
      errorMessage: null,
    }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled error in component tree:", error, info)
  }

  reset = () => {
    this.setState({ hasError: false, errorMessage: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-xl bg-white rounded-3xl shadow-xl border border-gray-200 p-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              {this.state.errorMessage ?? "An unexpected error occurred while rendering the page."}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button type="button" onClick={this.reset} className="inline-flex items-center justify-center rounded-xl border border-[#f97316] px-6 py-3 font-semibold text-[#f97316] transition-colors hover:bg-orange-50">
                Try again
              </button>
              <Link href="/" className="inline-flex items-center justify-center rounded-xl bg-[#f97316] px-6 py-3 text-white font-semibold hover:bg-[#ea580c] transition-colors">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
