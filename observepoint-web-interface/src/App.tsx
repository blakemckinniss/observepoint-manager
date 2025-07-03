import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WebJourneyList } from './pages/WebJourneyList';
import { WebJourneyDetail } from './pages/WebJourneyDetail';
import { RuleList } from './pages/RuleList';
import { Settings as SettingsPage } from './pages/Settings';
import { Home, Settings, FileText, PlayCircle } from 'lucide-react';
import { observePointClient } from './api/client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
    },
  },
});

function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">ObservePoint Manager</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`${
                  isActive('/') 
                    ? 'border-indigo-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
              <Link
                to="/journeys"
                className={`${
                  isActive('/journeys') || location.pathname.startsWith('/journeys/')
                    ? 'border-indigo-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Web Journeys
              </Link>
              <Link
                to="/rules"
                className={`${
                  isActive('/rules') 
                    ? 'border-indigo-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                <FileText className="w-4 h-4 mr-2" />
                Rules
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Link 
              to="/settings"
              className={`p-2 rounded-md ${
                isActive('/settings')
                  ? 'text-gray-900 bg-gray-100'
                  : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  // Use the same basename for both local and production
  const basename = '/observepoint-manager';
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router basename={basename}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          
          {!observePointClient.hasApiKey() && (
            <div className="bg-yellow-50 border-b border-yellow-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-yellow-800">
                    No API key configured. Please add your ObservePoint API key to start using the application.
                  </p>
                  <Link 
                    to="/settings"
                    className="text-sm font-medium text-yellow-800 hover:text-yellow-700"
                  >
                    Go to Settings →
                  </Link>
                </div>
              </div>
            </div>
          )}

          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/journeys" element={<WebJourneyList />} />
              <Route path="/journeys/:journeyId" element={<WebJourneyDetail />} />
              <Route path="/rules" element={<RuleList />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

function Dashboard() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to ObservePoint Manager</h2>
          <p className="text-gray-600 mb-8">Manage your web journeys and rules from one place.</p>
          <div className="space-x-4">
            <Link
              to="/journeys"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              View Web Journeys
            </Link>
            <Link
              to="/rules"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Manage Rules
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;