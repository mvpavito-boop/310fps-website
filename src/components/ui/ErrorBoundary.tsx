"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("[ErrorBoundary]", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex items-center justify-center min-h-[400px] px-4">
                    <div className="w-full max-w-md rounded-2xl bg-card border border-text-secondary/20 p-8 text-center">
                        {/* Error icon */}
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#E60000]/10 border border-[#E60000]/30">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#E60000"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-8 w-8"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>

                        {/* Heading */}
                        <h2 className="font-[family-name:var(--font-russo)] text-2xl text-foreground mb-3">
                            Что-то пошло не так
                        </h2>

                        {/* Error message */}
                        <p className="text-text-secondary text-sm mb-6 break-words">
                            {this.state.error?.message || "Произошла неизвестная ошибка"}
                        </p>

                        {/* Reset button */}
                        <button
                            onClick={this.handleReset}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white font-semibold px-6 py-3 transition-colors duration-200"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                            >
                                <polyline points="23 4 23 10 17 10" />
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                            </svg>
                            Попробовать снова
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/** Convenience wrapper: wraps a node in an ErrorBoundary */
function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
) {
    const WithErrorBoundary = (props: P) => (
        <ErrorBoundary fallback={fallback}>
            <WrappedComponent {...props} />
        </ErrorBoundary>
    );
    WithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;
    return WithErrorBoundary;
}

export { ErrorBoundary, withErrorBoundary };
export default ErrorBoundary;
