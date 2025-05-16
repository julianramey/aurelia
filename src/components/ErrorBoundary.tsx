import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in component:", error, errorInfo);
    this.setState({ error });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 p-2 text-xs text-red-700">
          <p className="font-semibold">Preview Error</p>
          <p>{this.props.fallbackMessage || "This preview could not be loaded."}</p>
          {/* <p className="mt-1 text-red-500 text-[10px]">{this.state.error?.message}</p> */}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 