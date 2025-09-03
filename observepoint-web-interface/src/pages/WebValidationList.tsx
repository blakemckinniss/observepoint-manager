import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Play, Trash2, Edit, Clock, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { observePointClient } from '../api/client';
import type { WebValidation, ValidationTemplate } from '../types/observepoint';
import { WebValidationForm } from '../components/WebValidationForm';

export function WebValidationList() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedValidation, setSelectedValidation] = useState<WebValidation | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ValidationTemplate | null>(null);
  const queryClient = useQueryClient();

  const { data: validations, isLoading, error } = useQuery({
    queryKey: ['webValidations'],
    queryFn: () => observePointClient.getWebValidations(),
    enabled: observePointClient.hasApiKey(),
  });

  const { data: templates } = useQuery({
    queryKey: ['validationTemplates'],
    queryFn: () => observePointClient.getValidationTemplates(),
  });

  const deleteMutation = useMutation({
    mutationFn: (validationId: string) => observePointClient.deleteWebValidation(validationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webValidations'] });
    },
  });

  const runMutation = useMutation({
    mutationFn: (validationId: string) => observePointClient.runWebValidation(validationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webValidations'] });
      queryClient.invalidateQueries({ queryKey: ['validationRuns'] });
    },
  });

  const handleTemplateSelect = (template: ValidationTemplate) => {
    setSelectedTemplate(template);
    setIsCreateModalOpen(true);
  };

  const handleEditValidation = (validation: WebValidation) => {
    setSelectedValidation(validation);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setSelectedValidation(null);
    setSelectedTemplate(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-400" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      manual: 'bg-gray-100 text-gray-800',
      daily: 'bg-blue-100 text-blue-800',
      weekly: 'bg-green-100 text-green-800',
      monthly: 'bg-purple-100 text-purple-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[frequency as keyof typeof colors] || colors.manual}`}>
        {frequency}
      </span>
    );
  };

  if (!observePointClient.hasApiKey()) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please configure your API key to view Web Validations.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>;
  }

  if (error) {
    return <div className="text-center py-12">
      <p className="text-red-500">Error loading validations: {(error as Error).message}</p>
    </div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Web Validations</h1>
          <p className="mt-2 text-sm text-gray-700">
            Automated validation of page tracking and user interactions
          </p>
        </div>
      </div>

      {/* Template Selection Cards */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Start Templates</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates?.map((template) => (
            <div
              key={template.id}
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-indigo-500 cursor-pointer transition-colors"
              onClick={() => handleTemplateSelect(template)}
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-indigo-600" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.description}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                      {template.validations.length} validation{template.validations.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Custom Validation Card */}
          <div
            className="relative rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-5 hover:border-indigo-500 cursor-pointer transition-colors"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <div className="flex items-center space-x-3">
              <Plus className="h-6 w-6 text-gray-400" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-gray-900">Custom Validation</h3>
                <p className="text-sm text-gray-500">Create a custom validation workflow</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Existing Validations Table */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Your Validations</h2>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Validations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Run
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {validations?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No validations created yet. Choose a template above to get started.
                  </td>
                </tr>
              ) : (
                validations?.map((validation) => (
                  <tr key={validation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusIcon(validation.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {validation.name}
                        </div>
                        {validation.description && (
                          <div className="text-sm text-gray-500">
                            {validation.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {validation.url}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getFrequencyBadge(validation.frequency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {validation.validations.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {validation.lastRun ? new Date(validation.lastRun).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => runMutation.mutate(validation.id)}
                          disabled={validation.status === 'running'}
                          className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                          title="Run Validation"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditValidation(validation)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit Validation"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this validation?')) {
                              deleteMutation.mutate(validation.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Validation"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <WebValidationForm
          validation={selectedValidation}
          template={selectedTemplate}
          onClose={handleCloseModal}
          onSuccess={() => {
            handleCloseModal();
            queryClient.invalidateQueries({ queryKey: ['webValidations'] });
          }}
        />
      )}
    </div>
  );
}