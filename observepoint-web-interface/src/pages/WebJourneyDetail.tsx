import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  useWebJourney, 
  useJourneyActions, 
  useJourneyRuns,
  useRunWebJourney,
  useAddJourneyAction,
  useDeleteJourneyAction
} from '../hooks/useObservePoint';
import { 
  ArrowLeft, 
  PlayCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  MousePointer,
  Navigation,
  Type,
  Clock,
  Scroll,
  Code
} from 'lucide-react';
import type { WebJourneyAction } from '../types/observepoint';
import { ApiKeyGuard } from '../components/ApiKeyGuard';

export function WebJourneyDetail() {
  const { journeyId } = useParams<{ journeyId: string }>();
  const { data: journey, isLoading: journeyLoading } = useWebJourney(journeyId!);
  const { data: actions, isLoading: actionsLoading } = useJourneyActions(journeyId!);
  const { data: runs } = useJourneyRuns(journeyId!);
  const runJourney = useRunWebJourney();
  const addAction = useAddJourneyAction();
  const deleteAction = useDeleteJourneyAction();

  const [isAddingAction, setIsAddingAction] = useState(false);
  const [newAction, setNewAction] = useState<Partial<WebJourneyAction>>({
    type: 'click',
    order: 1,
  });

  const handleRunJourney = async () => {
    if (!journeyId) return;
    try {
      await runJourney.mutateAsync(journeyId);
      alert('Journey started successfully!');
    } catch (error) {
      alert('Failed to start journey: ' + error);
    }
  };

  const handleAddAction = async () => {
    if (!journeyId) return;
    try {
      await addAction.mutateAsync({
        journeyId,
        action: {
          ...newAction,
          order: (actions?.length || 0) + 1,
        },
      });
      setIsAddingAction(false);
      setNewAction({ type: 'click', order: 1 });
    } catch (error) {
      alert('Failed to add action: ' + error);
    }
  };

  const handleDeleteAction = async (actionId: string) => {
    if (!journeyId || !confirm('Are you sure you want to delete this action?')) return;
    try {
      await deleteAction.mutateAsync({ journeyId, actionId });
    } catch (error) {
      alert('Failed to delete action: ' + error);
    }
  };

  const getActionDescription = (action: WebJourneyAction): string => {
    if (action.description) return action.description;
    
    switch (action.type) {
      case 'click':
        return action.selector ? `Click on: ${action.selector}` : 'Click action';
      case 'navigate':
        return action.url ? `Navigate to: ${action.url}` : 'Navigate action';
      case 'input':
        return action.selector ? `Input text in: ${action.selector}` : 'Input action';
      case 'wait':
        return action.waitTime ? `Wait for ${action.waitTime}ms` : 'Wait action';
      case 'scroll':
        return action.selector ? `Scroll to: ${action.selector}` : 'Scroll action';
      case 'javascript':
        return 'Execute JavaScript code';
      default:
        return 'Unknown action';
    }
  };

  const getActionIcon = (type: WebJourneyAction['type']) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'click':
        return <MousePointer className={iconClass} />;
      case 'navigate':
        return <Navigation className={iconClass} />;
      case 'input':
        return <Type className={iconClass} />;
      case 'wait':
        return <Clock className={iconClass} />;
      case 'scroll':
        return <Scroll className={iconClass} />;
      case 'javascript':
        return <Code className={iconClass} />;
      default:
        return null;
    }
  };

  if (journeyLoading || actionsLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!journey) {
    return <div>Journey not found</div>;
  }

  return (
    <ApiKeyGuard>
      <div className="space-y-6">
      <div>
        <Link 
          to="/journeys" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Journeys
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">{journey.name}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{journey.description}</p>
          </div>
          <button
            onClick={handleRunJourney}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Run Journey
          </button>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Journey ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{journey.id}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  journey.status === 'active' ? 'bg-green-100 text-green-800' :
                  journey.status === 'running' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {journey.status}
                </span>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Last Run</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {journey.lastRun ? new Date(journey.lastRun).toLocaleString() : 'Never'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Journey Actions</h3>
          <button
            onClick={() => setIsAddingAction(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Action
          </button>
        </div>
        <div className="border-t border-gray-200">
          {isAddingAction && (
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Action Type</label>
                  <select
                    value={newAction.type}
                    onChange={(e) => setNewAction({ ...newAction, type: e.target.value as WebJourneyAction['type'] })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="click">Click</option>
                    <option value="navigate">Navigate</option>
                    <option value="input">Input</option>
                    <option value="wait">Wait</option>
                    <option value="scroll">Scroll</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </div>
                
                {newAction.type === 'click' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Selector</label>
                    <input
                      type="text"
                      value={newAction.selector || ''}
                      onChange={(e) => setNewAction({ ...newAction, selector: e.target.value })}
                      className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="e.g., #submit-button"
                    />
                  </div>
                )}
                
                {newAction.type === 'navigate' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL</label>
                    <input
                      type="text"
                      value={newAction.url || ''}
                      onChange={(e) => setNewAction({ ...newAction, url: e.target.value })}
                      className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="https://example.com"
                    />
                  </div>
                )}
                
                {newAction.type === 'input' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Selector</label>
                      <input
                        type="text"
                        value={newAction.selector || ''}
                        onChange={(e) => setNewAction({ ...newAction, selector: e.target.value })}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g., input[name='email']"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Value</label>
                      <input
                        type="text"
                        value={newAction.value || ''}
                        onChange={(e) => setNewAction({ ...newAction, value: e.target.value })}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="Text to input"
                      />
                    </div>
                  </>
                )}
                
                {newAction.type === 'wait' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Wait Time (ms)</label>
                    <input
                      type="number"
                      value={newAction.waitTime || ''}
                      onChange={(e) => setNewAction({ ...newAction, waitTime: parseInt(e.target.value) })}
                      className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="1000"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    value={newAction.description || ''}
                    onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Optional description"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleAddAction}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Save Action
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingAction(false);
                      setNewAction({ type: 'click', order: 1 });
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <ul className="divide-y divide-gray-200">
            {actions?.map((action, index) => (
              <li key={action.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getActionIcon(action.type)}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        Step {index + 1}: {action.type}
                      </p>
                      <p className="text-sm text-gray-500">
                        {getActionDescription(action)}
                      </p>
                      {action.type === 'javascript' && action.script && (
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          <code>{action.script}</code>
                        </pre>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button className="text-indigo-600 hover:text-indigo-900">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteAction(action.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {runs && runs.length > 0 && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Runs</h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {runs.slice(0, 5).map((run) => (
                <li key={run.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(run.startTime).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Status: <span className={`font-medium ${
                          run.status === 'completed' ? 'text-green-600' :
                          run.status === 'failed' ? 'text-red-600' :
                          'text-blue-600'
                        }`}>{run.status}</span>
                        {run.duration && ` • Duration: ${(run.duration / 1000).toFixed(2)}s`}
                      </p>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-900 text-sm">
                      View Results
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
    </ApiKeyGuard>
  );
}