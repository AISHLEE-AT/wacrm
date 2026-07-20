'use client';
import React from 'react';
import { ShieldAlert } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Widget Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', border: '1px solid #EF4444' }}>
          <ShieldAlert size={24} color="#EF4444" style={{ margin: '0 auto 8px auto' }} />
          <h3 style={{ color: '#EF4444', fontSize: '14px', marginBottom: '8px' }}>Widget Error</h3>
          <p style={{ color: 'var(--cool-gray)', fontSize: '12px' }}>{this.state.error?.message || "Failed to load this component."}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
