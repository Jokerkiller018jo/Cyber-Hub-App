import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { loadTheme, applyTheme } from './services/theme';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: '20px' }}>
          <h2>React Runtime Error</h2>
          <pre>{this.state.error.message}\n{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

try {
  // Initialize theme before rendering
  applyTheme(loadTheme());

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
} catch (e) {
  document.getElementById('root').innerHTML = `<div style="color:red; padding: 20px;">
    <h2>Boot Error</h2>
    <pre>${e.message}\n${e.stack}</pre>
  </div>`;
}
