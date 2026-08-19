import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    isChunkError: boolean;
}

/**
 * Global Error Boundary
 *
 * Catches two kinds of errors:
 * 1. Chunk load failures (stale deployment) → auto-reloads the page once
 * 2. Other React render errors → shows a friendly fallback UI
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, isChunkError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        // Detect stale chunk / module load errors
        const isChunkError =
            error.message?.includes('Failed to fetch dynamically imported module') ||
            error.message?.includes('Importing a module script failed') ||
            error.message?.includes('error loading dynamically imported module') ||
            error.message?.includes('Loading chunk') ||
            error.message?.includes('Loading CSS chunk') ||
            error.name === 'ChunkLoadError';

        return { hasError: true, isChunkError };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary]', error.message, info.componentStack);
    }

    componentDidUpdate(_: Props, prevState: State) {
        if (this.state.isChunkError && !prevState.isChunkError) {
            // Auto-reload once for stale chunk errors
            // Use sessionStorage to prevent infinite reload loops
            const reloadKey = 'chunk_error_reload';
            const lastReload = sessionStorage.getItem(reloadKey);
            const now = Date.now();

            if (!lastReload || now - parseInt(lastReload) > 10_000) {
                sessionStorage.setItem(reloadKey, now.toString());
                window.location.reload();
            }
        }
    }

    handleReload = () => {
        sessionStorage.removeItem('chunk_error_reload');
        window.location.reload();
    };

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
                        {this.state.isChunkError ? 'New Version Available' : 'Something Went Wrong'}
                    </h1>

                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        {this.state.isChunkError
                            ? 'A new version of Kays Drive was deployed. Please refresh to load the latest version.'
                            : 'An unexpected error occurred. Please try refreshing the page.'}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={this.handleReload}
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-red-100"
                        >
                            Refresh Page
                        </button>
                        <a
                            href="/"
                            className="border-2 border-gray-200 hover:border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-bold text-sm transition-colors"
                        >
                            Go Home
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}

export default ErrorBoundary;
