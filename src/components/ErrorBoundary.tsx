import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AROH Global Error Boundary Caught:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleClearCacheAndReset = () => {
    try {
      // Clear temporary session data while keeping primary essential profile if possible
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0B0F1E] text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#0E1424] rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] dark:border-[#1E293B] shadow-xl text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-amber-600 dark:text-cyan-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                Something unexpected occurred
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] leading-relaxed">
                The application encountered an isolated processing error. Your saved workout and nutrition data remains safe.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1E201F] border border-[#E5E7EB] dark:border-[#1E293B] text-left">
                <div className="text-[11px] font-mono text-red-600 dark:text-red-400 break-words line-clamp-3">
                  {this.state.error.toString()}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00D4FF] text-white text-xs font-bold hover:bg-[#0369A1] shadow-sm transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleClearCacheAndReset}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1E201F] border border-[#E5E7EB] dark:border-[#1E293B] text-[#1A1D1B] dark:text-[#E8ECE9] text-xs font-semibold hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] transition-all cursor-pointer"
              >
                <span>Reset Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
