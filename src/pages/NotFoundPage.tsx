import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 tracking-tight mb-3">
          404
        </h1>
        <p className="text-base text-gray-500 mb-8">Page not found.</p>
        <Link
          to="/dashboard"
          className="inline-flex px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
