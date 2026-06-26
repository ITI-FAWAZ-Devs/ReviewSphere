import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import i18n from '@/i18n';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-rs-danger/10 flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-rs-danger" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {i18n.t('error.boundary.title')}
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mb-8">
            {i18n.t('error.boundary.message')}
          </p>
          <button
            onClick={this.handleRefresh}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-rs-accent hover:bg-rs-accent-hover text-white rounded-xl font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> {i18n.t('error.boundary.refresh')}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
