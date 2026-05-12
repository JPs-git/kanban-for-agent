import { useState, useEffect } from 'react';
import KanbanBoard from './components/KanbanBoard';
import { getVersion } from './services/api';
import type { VersionInfo } from './services/api';

function App() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);

  useEffect(() => {
    getVersion().then(setVersionInfo).catch(() => {});
  }, []);

  return (
    <div className="app min-h-screen flex flex-col">
      <KanbanBoard />
      {versionInfo && (
        <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 text-gray-400 text-xs py-2 px-4 text-center">
          Version: {versionInfo.version} | Environment: {versionInfo.environment}
        </footer>
      )}
    </div>
  );
}

export default App
