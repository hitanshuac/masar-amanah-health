/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ENG-9: React ErrorBoundary
 * Catches rendering errors gracefully instead of crashing the entire app.
 * Displays a recovery UI with session reset capability.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[Masar Amanah ErrorBoundary]', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-lg text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Something Went Wrong
            </h2>
            <p className="text-sm text-slate-600">
              An unexpected error occurred in the screening interface.
              Your privacy remains protected — no data was transmitted or stored.
            </p>
            <p className="text-xs text-slate-400 font-mono bg-slate-50 rounded-lg p-3 text-start break-all">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={this.handleReset}
              className="w-full px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset & Restart</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
