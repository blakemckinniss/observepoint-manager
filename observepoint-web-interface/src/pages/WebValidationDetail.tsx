import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Play, RefreshCw, CheckCircle, XCircle, AlertCircle, Clock, Calendar, Activity, Image } from 'lucide-react';
import { observePointClient } from '../api/client';
import type { ValidationRun, ValidationResult } from '../types/observepoint';

export function WebValidationDetail() {
  const { validationId } = useParams<{ validationId: string }>();
  // const navigate = useNavigate(); // Uncomment when needed
  const queryClient = useQueryClient();
  const [selectedRun, setSelectedRun] = useState<ValidationRun | null>(null);

  const { data: validation } = useQuery({
    queryKey: ['webValidation', validationId],
    queryFn: () => observePointClient.getWebValidation(validationId!),
    enabled: !!validationId && observePointClient.hasApiKey(),
  });

  const { data: runs, isLoading: isLoadingRuns, refetch: refetchRuns } = useQuery({
    queryKey: ['validationRuns', validationId],
    queryFn: () => observePointClient.getValidationRuns(validationId!),
    enabled: !!validationId && observePointClient.hasApiKey(),
  });

  const runMutation = useMutation({
    mutationFn: () => observePointClient.runWebValidation(validationId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webValidation', validationId] });
      queryClient.invalidateQueries({ queryKey: ['validationRuns', validationId] });
      refetchRuns();
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'skipped':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      skipped: 'bg-yellow-100 text-yellow-800',
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
      }`}>
        {status}
      </span>
    );
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  if (!observePointClient.hasApiKey()) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please configure your API key to view Web Audit details.</p>
      </div>
    );
  }

  if (isLoadingRuns) {
    return <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>;
  }

  if (!validation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Audit not found.</p>
        <Link to="/validations" className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block">
          Back to Audits
        </Link>
      </div>
    );
  }

  const latestRun = runs?.[0];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Link 
            to="/validations" 
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{validation.name}</h1>
            {validation.description && (
              <p className="mt-1 text-sm text-gray-600">{validation.description}</p>
            )}
          </div>
          <button
            onClick={() => runMutation.mutate()}
            disabled={validation.status === 'running' || runMutation.isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {runMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Audit
              </>
            )}
          </button>
        </div>

        {/* Audit Info Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Status
              </dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {getStatusBadge(validation.status)}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Frequency
              </dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900 capitalize">
                {validation.frequency}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Validations
              </dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {validation.validations.length}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Last Run
              </dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {validation.lastRun ? new Date(validation.lastRun).toLocaleString() : 'Never'}
              </dd>
            </div>
          </div>
        </div>

        {/* Target URL */}
        <div className="bg-white shadow rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-gray-500">Target URL</p>
          <a 
            href={validation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
          >
            {validation.url}
          </a>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Run History */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Run History</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {isLoadingRuns ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              ) : runs?.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No runs yet. Click "Run Audit" to start.
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {runs?.map((run) => (
                    <button
                      key={run.id}
                      onClick={() => setSelectedRun(run)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                        selectedRun?.id === run.id ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          {getStatusIcon(run.status)}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(run.startTime).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              Duration: {formatDuration(run.duration)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {run.summary && (
                        <div className="mt-2 flex items-center space-x-4 text-xs">
                          <span className="text-green-600">
                            ✓ {run.summary.passed}
                          </span>
                          <span className="text-red-600">
                            ✗ {run.summary.failed}
                          </span>
                          <span className="text-yellow-600">
                            ⊘ {run.summary.skipped}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Run Details */}
        <div className="lg:col-span-2">
          {selectedRun || latestRun ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Run Results - {new Date((selectedRun || latestRun)!.startTime).toLocaleString()}
                </h3>
                {(selectedRun || latestRun)!.summary && (
                  <div className="mt-2 flex items-center space-x-6">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-700">
                        {(selectedRun || latestRun)!.summary.passed} Passed
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <XCircle className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-red-700">
                        {(selectedRun || latestRun)!.summary.failed} Failed
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <AlertCircle className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-yellow-700">
                        {(selectedRun || latestRun)!.summary.skipped} Skipped
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                {(selectedRun || latestRun)!.results.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No validation results available.</p>
                ) : (
                  <div className="space-y-4">
                    {(selectedRun || latestRun)!.results.map((result: ValidationResult, index: number) => (
                      <div
                        key={`${result.validationStepId}-${index}`}
                        className={`border rounded-lg p-4 ${
                          result.status === 'passed' 
                            ? 'border-green-200 bg-green-50' 
                            : result.status === 'failed'
                            ? 'border-red-200 bg-red-50'
                            : 'border-yellow-200 bg-yellow-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            {getStatusIcon(result.status)}
                            <div className="ml-3 flex-1">
                              <h4 className="text-sm font-medium text-gray-900">
                                {result.validationStepName}
                              </h4>
                              {result.message && (
                                <p className="mt-1 text-sm text-gray-600">
                                  {result.message}
                                </p>
                              )}
                              {result.details && (
                                <div className="mt-2 text-xs text-gray-500">
                                  <pre className="bg-white p-2 rounded border overflow-x-auto">
                                    {JSON.stringify(result.details, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                          {result.screenshot && (
                            <button
                              onClick={() => window.open(result.screenshot, '_blank')}
                              className="ml-4 text-gray-400 hover:text-gray-600"
                              title="View Screenshot"
                            >
                              <Image className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg">
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No run selected. Run the validation or select a run from history to view results.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Validation Configuration */}
      <div className="mt-6 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Validation Configuration</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-3">
            {validation.validations.map((validation) => (
              <div key={validation.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-500 mr-2">#{validation.sequence}</span>
                    <span className="text-sm font-medium text-gray-900">{validation.name}</span>
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {validation.type}
                    </span>
                    {!validation.enabled && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Disabled
                      </span>
                    )}
                  </div>
                </div>
                {Object.keys(validation.config).length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    <pre className="bg-gray-50 p-2 rounded overflow-x-auto">
                      {JSON.stringify(validation.config, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}