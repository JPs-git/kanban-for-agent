import { useState, useEffect } from 'react';
import { getVersion } from '../services/api';
import type { VersionInfo } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';

function About() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVersion()
      .then((data) => {
        setVersionInfo(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch version info');
        setLoading(false);
      });
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">About Kanban Board</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Version Information</h2>
          
          {loading ? (
            <div className="text-gray-500">Loading version info...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : versionInfo ? (
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Version</span>
                <span className="font-mono text-gray-800">{versionInfo.version}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Environment</span>
                <span className={`font-mono px-3 py-1 rounded-full text-sm ${
                  versionInfo.environment === 'production' 
                    ? 'bg-red-100 text-red-700' 
                    : versionInfo.environment === 'development'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {versionInfo.environment}
                </span>
              </div>
              {versionInfo.buildDate && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Build Date</span>
                  <span className="font-mono text-gray-800">{versionInfo.buildDate}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">No version info available</div>
          )}
        </div>

        <div className="mt-6 text-center text-gray-500 text-sm">
          Kanban Board Application - Task Management System
        </div>
      </div>
    </DashboardLayout>
  );
}

export default About;