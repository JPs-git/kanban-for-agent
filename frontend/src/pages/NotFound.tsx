import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

function NotFound() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl font-bold text-gray-400 mb-4">404</div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go back to Home
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default NotFound;