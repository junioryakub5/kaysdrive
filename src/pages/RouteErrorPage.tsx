import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

/**
 * Route-level error element for react-router.
 * Handles chunk load failures (stale deployments) with auto-reload,
 * and shows a friendly 404 or generic error for other cases.
 */
export default function RouteErrorPage() {
    const error = useRouteError();

    // Check if this is a stale chunk / module import error
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isChunkError =
        errorMessage.includes('Failed to fetch dynamically imported module') ||
        errorMessage.includes('Importing a module script failed') ||
        errorMessage.includes('error loading dynamically imported module') ||
        errorMessage.includes('Loading chunk') ||
        errorMessage.includes('Loading CSS chunk');

    if (isChunkError) {
        // Auto-reload once (with loop protection)
        const reloadKey = 'route_chunk_reload';
        const lastReload = sessionStorage.getItem(reloadKey);
        const now = Date.now();

        if (!lastReload || now - parseInt(lastReload) > 10_000) {
            sessionStorage.setItem(reloadKey, now.toString());
            window.location.reload();
            return null; // Will reload before rendering
        }

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-2">New Version Available</h1>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        Kays Drive has been updated. Click below to load the latest version.
                    </p>
                    <button
                        onClick={() => { sessionStorage.removeItem(reloadKey); window.location.reload(); }}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-red-100"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    // 404
    if (isRouteErrorResponse(error) && error.status === 404) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <h1 className="text-7xl font-black text-red-600 mb-4">404</h1>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Page Not Found</h2>
                    <p className="text-gray-500 text-sm mb-6">The page you're looking for doesn't exist.</p>
                    <Link to="/" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-red-100">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    // Generic error
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Something Went Wrong</h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">An unexpected error occurred. Please try refreshing.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-red-100"
                    >
                        Refresh
                    </button>
                    <Link to="/" className="border-2 border-gray-200 hover:border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-bold text-sm transition-colors">
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
