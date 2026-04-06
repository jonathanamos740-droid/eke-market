import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: string;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error?.message || 'Unknown error' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#0D0D0F',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif',
            padding: 24,
            textAlign: 'center',
          }}
        >
          <svg width="120" height="80" viewBox="155 25 185 115" xmlns="http://www.w3.org/2000/svg">
            <rect x="155" y="30" width="9" height="78" fill="#BA7517" />
            <rect x="155" y="30" width="44" height="11" fill="#BA7517" />
            <rect x="155" y="62" width="34" height="10" fill="#EF9F27" />
            <rect x="155" y="97" width="44" height="11" fill="#BA7517" />
            <rect x="216" y="30" width="11" height="78" fill="#BA7517" />
            <polygon points="227,30 272,30 272,44 227,69" fill="#BA7517" />
            <polygon points="227,69 272,97 272,108 227,108" fill="#BA7517" />
            <rect x="290" y="30" width="9" height="78" fill="#BA7517" />
            <rect x="290" y="30" width="44" height="11" fill="#BA7517" />
            <rect x="290" y="62" width="34" height="10" fill="#EF9F27" />
            <rect x="290" y="97" width="44" height="11" fill="#BA7517" />
          </svg>
          <p
            style={{
              color: '#BA7517',
              fontSize: 18,
              fontWeight: 700,
              marginTop: 24,
            }}
          >
            Something went wrong
          </p>
          <p
            style={{
              color: '#666',
              fontSize: 14,
              marginTop: 8,
            }}
          >
            {this.state.error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 24,
              background: '#BA7517',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 32px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;