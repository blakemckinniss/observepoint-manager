import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWebJourneys, useRunWebJourney, useDeleteWebJourney } from '../hooks/useObservePoint';
import { PlayCircle, Plus, Edit2, Trash2 } from 'lucide-react';
import type { WebJourney } from '../types/observepoint';
import { ApiKeyGuard } from '../components/ApiKeyGuard';
import { CreateJourneyModal } from '../components/CreateJourneyModal';

export function WebJourneyList() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: journeys, isLoading, error } = useWebJourneys();
  const runJourney = useRunWebJourney();
  const deleteJourney = useDeleteWebJourney();

  const handleRunJourney = async (journeyId: string) => {
    try {
      await runJourney.mutateAsync(journeyId);
      alert('Journey started successfully!');
    } catch (error) {
      alert('Failed to start journey: ' + error);
    }
  };

  const handleNewJourney = () => {
    setShowCreateModal(true);
  };

  const handleDeleteJourney = async (journeyId: string, journeyName: string) => {
    if (window.confirm(`Are you sure you want to delete the journey "${journeyName}"? This action cannot be undone.`)) {
      try {
        await deleteJourney.mutateAsync(journeyId);
        alert('Journey deleted successfully!');
      } catch (error) {
        alert('Failed to delete journey: ' + error);
      }
    }
  };


  const getStatusBadge = (status: WebJourney['status']) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'running':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return baseClasses;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading journeys: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  // Show all journeys
  const filteredJourneys = journeys || [];

  return (
    <ApiKeyGuard>
      <div>
        <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Web Journeys</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and monitor your web journeys.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={handleNewJourney}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Journey
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Description
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Last Run
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredJourneys.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-sm text-gray-500 text-center">
                        No journeys found. Click "New Journey" to create your first journey.
                      </td>
                    </tr>
                  ) : (
                    filteredJourneys.map((journey) => (
                      <tr key={journey.id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={getStatusBadge(journey.status)}>
                            {journey.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                          <Link
                            to={`/journeys/${journey.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {journey.name}
                          </Link>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {journey.description || '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {journey.lastRun ? new Date(journey.lastRun).toLocaleString() : 'Never'}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRunJourney(journey.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Run Journey"
                            >
                              <PlayCircle className="w-5 h-5" />
                            </button>
                            <Link
                              to={`/journeys/${journey.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit Journey"
                            >
                              <Edit2 className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteJourney(journey.id, journey.name)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Journey"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <CreateJourneyModal 
      isOpen={showCreateModal} 
      onClose={() => setShowCreateModal(false)} 
    />
    </ApiKeyGuard>
  );
}