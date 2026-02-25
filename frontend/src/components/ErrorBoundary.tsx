import React, { Component } from "react";
import { Navigate } from "react-router-dom";

type ErrorBoundaryProps = {
    children: React.ReactNode;
    fallbackPath?: string;
    resetKey?: string;
};

type ErrorBoundaryState = {
    hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(): void {
        // Error details can be logged here if needed.
    }

    componentDidUpdate(prevProps: ErrorBoundaryProps): void {
        if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
            this.setState({ hasError: false });
        }
    }

    render() {
        if (this.state.hasError) {
            return <Navigate to={this.props.fallbackPath ?? "/500"} replace />;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
