import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { observePointClient } from '../api/client';
import { AlertCircle } from 'lucide-react';

interface ApiKeyGuardProps {
  children: ReactNode;
}

export function ApiKeyGuard({ children }: ApiKeyGuardProps) {
  if (!observePointClient.hasApiKey()) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No API Key Configured</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-md">
            You need to configure your ObservePoint API key before you can access web journeys and rules.
          </p>
          <div className="mt-6">
            <Link
              to="/settings"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Configure API Key
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}