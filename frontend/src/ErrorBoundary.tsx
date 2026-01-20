import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ Error Boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          padding: '20px',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            maxWidth: '600px',
            textAlign: 'center'
          }}>
            <h1 style={{ color: '#e74c3c', marginBottom: '20px' }}>⚠️ Application Error</h1>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '16px' }}>
              The application encountered an unexpected error.
            </p>
            <details style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '4px',
              textAlign: 'left',
              marginBottom: '20px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#333' }}>
                Error Details (click to expand)
              </summary>
              <pre style={{
                marginTop: '10px',
                color: '#d32f2f',
                fontSize: '12px',
                overflow: 'auto'
              }}>
                {this.state.error?.toString()}
                {'\n\n'}
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2980b9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3498db')}
            >
              Reload Application
            </button>
            <p style={{ color: '#999', marginTop: '20px', fontSize: '12px' }}>
              Check browser console (F12) for more details
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
