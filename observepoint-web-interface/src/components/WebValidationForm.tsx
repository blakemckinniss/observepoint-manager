import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, Plus, Trash2, ChevronUp, ChevronDown, Save, AlertCircle } from 'lucide-react';
import { observePointClient } from '../api/client';
import type { WebValidation, ValidationTemplate, ValidationStep, TemplateVariable } from '../types/observepoint';

interface WebValidationFormProps {
  validation?: WebValidation | null;
  template?: ValidationTemplate | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function WebValidationForm({ validation, template, onClose, onSuccess }: WebValidationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    frequency: 'manual' as const,
    validations: [] as ValidationStep[],
  });

  const [templateVariables, setTemplateVariables] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (validation) {
      setFormData({
        name: validation.name,
        description: validation.description || '',
        url: validation.url,
        frequency: validation.frequency,
        validations: validation.validations,
      });
    } else if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        url: '',
        frequency: 'manual',
        validations: template.validations.map((v, index) => ({
          ...v,
          id: `validation-${index}`,
        })),
      });
      
      // Initialize template variables with defaults
      const defaultVars: Record<string, any> = {};
      template.variables.forEach(v => {
        defaultVars[v.key] = v.defaultValue || '';
      });
      setTemplateVariables(defaultVars);
    }
  }, [validation, template]);

  const createMutation = useMutation({
    mutationFn: (data: Partial<WebValidation>) => observePointClient.createWebValidation(data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      setErrors({ submit: (error as Error).message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WebValidation> }) => 
      observePointClient.updateWebValidation(id, data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      setErrors({ submit: (error as Error).message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.url.trim() && !template) newErrors.url = 'URL is required';

    // Validate template variables if using template
    if (template) {
      template.variables.forEach(v => {
        if (v.required && !templateVariables[v.key]) {
          newErrors[v.key] = `${v.label} is required`;
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Apply template variables to validations
    let processedValidations = formData.validations;
    if (template) {
      processedValidations = formData.validations.map(validation => {
        const processedConfig = { ...validation.config };
        
        // Replace template variables in config values
        Object.keys(processedConfig).forEach(key => {
          const value = processedConfig[key];
          if (typeof value === 'string' && value.includes('{{')) {
            let processed = value;
            Object.keys(templateVariables).forEach(varKey => {
              processed = processed.replace(new RegExp(`{{${varKey}}}`, 'g'), templateVariables[varKey]);
            });
            processedConfig[key] = processed;
          }
        });
        
        return { ...validation, config: processedConfig };
      });
    }

    const validationData: Partial<WebValidation> = {
      name: formData.name,
      description: formData.description,
      url: templateVariables.url || formData.url,
      frequency: formData.frequency,
      validations: processedValidations,
      templateId: template?.id,
    };

    if (validation) {
      updateMutation.mutate({ id: validation.id, data: validationData });
    } else {
      createMutation.mutate(validationData);
    }
  };

  const addValidation = () => {
    const newValidation: ValidationStep = {
      id: `validation-${Date.now()}`,
      name: 'New Validation',
      type: 'dom_element',
      sequence: formData.validations.length + 1,
      enabled: true,
      config: {},
    };
    setFormData({ ...formData, validations: [...formData.validations, newValidation] });
  };

  const removeValidation = (id: string) => {
    setFormData({
      ...formData,
      validations: formData.validations
        .filter(v => v.id !== id)
        .map((v, index) => ({ ...v, sequence: index + 1 })),
    });
  };

  const updateValidation = (id: string, updates: Partial<ValidationStep>) => {
    setFormData({
      ...formData,
      validations: formData.validations.map(v => 
        v.id === id ? { ...v, ...updates } : v
      ),
    });
  };

  const moveValidation = (id: string, direction: 'up' | 'down') => {
    const index = formData.validations.findIndex(v => v.id === id);
    if (index === -1) return;
    
    const newValidations = [...formData.validations];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newValidations.length) {
      [newValidations[index], newValidations[targetIndex]] = 
      [newValidations[targetIndex], newValidations[index]];
      
      // Update sequences
      newValidations.forEach((v, i) => {
        v.sequence = i + 1;
      });
      
      setFormData({ ...formData, validations: newValidations });
    }
  };

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {validation ? 'Edit Web Validation' : template ? `Create Validation from Template: ${template.name}` : 'Create Custom Web Validation'}
                </h3>
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                  onClick={onClose}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Validation Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="manual">Manual</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              {/* Template Variables */}
              {template && template.variables.length > 0 && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Template Configuration</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {template.variables.map((variable) => (
                      <div key={variable.key}>
                        <label className="block text-sm font-medium text-gray-700">
                          {variable.label} {variable.required && <span className="text-red-500">*</span>}
                        </label>
                        {variable.helpText && (
                          <p className="text-xs text-gray-500 mt-1">{variable.helpText}</p>
                        )}
                        {variable.type === 'select' && variable.options ? (
                          <select
                            value={templateVariables[variable.key] || ''}
                            onChange={(e) => setTemplateVariables({ 
                              ...templateVariables, 
                              [variable.key]: e.target.value 
                            })}
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                              errors[variable.key] ? 'border-red-500' : ''
                            }`}
                          >
                            <option value="">Select...</option>
                            {variable.options.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={variable.type === 'number' ? 'number' : 'text'}
                            value={templateVariables[variable.key] || ''}
                            onChange={(e) => setTemplateVariables({ 
                              ...templateVariables, 
                              [variable.key]: e.target.value 
                            })}
                            placeholder={variable.placeholder}
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                              errors[variable.key] ? 'border-red-500' : ''
                            }`}
                          />
                        )}
                        {errors[variable.key] && (
                          <p className="mt-1 text-sm text-red-600">{errors[variable.key]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* URL field (only if not using template or template doesn't have URL variable) */}
              {!template || !template.variables.find(v => v.key === 'url') ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Target URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://www.example.com/page"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      errors.url ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.url && <p className="mt-1 text-sm text-red-600">{errors.url}</p>}
                </div>
              ) : null}

              {/* Validations */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">Validations</h4>
                  {!template && (
                    <button
                      type="button"
                      onClick={addValidation}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Validation
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {formData.validations.map((validation, index) => (
                    <div key={validation.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-gray-500">#{validation.sequence}</span>
                            <input
                              type="text"
                              value={validation.name}
                              onChange={(e) => updateValidation(validation.id, { name: e.target.value })}
                              className="flex-1 text-sm font-medium border-0 border-b border-gray-300 focus:border-indigo-500 focus:ring-0"
                              readOnly={!!template}
                            />
                            {!template && (
                              <select
                                value={validation.type}
                                onChange={(e) => updateValidation(validation.id, { type: e.target.value as any })}
                                className="text-sm border-gray-300 rounded-md"
                              >
                                <option value="page_view">Page View</option>
                                <option value="click_tracking">Click Tracking</option>
                                <option value="dom_element">DOM Element</option>
                                <option value="network_request">Network Request</option>
                                <option value="custom_js">Custom JavaScript</option>
                              </select>
                            )}
                          </div>
                          
                          {/* Validation Type-Specific Config */}
                          {validation.type === 'page_view' && (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <label className="text-xs text-gray-500">Variable Name</label>
                                <input
                                  type="text"
                                  value={validation.config.pageNameVariable || ''}
                                  onChange={(e) => updateValidation(validation.id, {
                                    config: { ...validation.config, pageNameVariable: e.target.value }
                                  })}
                                  placeholder="eVar100"
                                  className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                  readOnly={!!template}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500">Expected Value</label>
                                <input
                                  type="text"
                                  value={validation.config.expectedPageName || ''}
                                  onChange={(e) => updateValidation(validation.id, {
                                    config: { ...validation.config, expectedPageName: e.target.value }
                                  })}
                                  placeholder="page-name"
                                  className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                  readOnly={!!template}
                                />
                              </div>
                            </div>
                          )}
                          
                          {validation.type === 'click_tracking' && (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <label className="text-xs text-gray-500">Element Selector</label>
                                <input
                                  type="text"
                                  value={validation.config.selector || ''}
                                  onChange={(e) => updateValidation(validation.id, {
                                    config: { ...validation.config, selector: e.target.value }
                                  })}
                                  placeholder='[data-link-info="cta"]'
                                  className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                  readOnly={!!template}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500">Click Variable</label>
                                <input
                                  type="text"
                                  value={validation.config.clickVariable || ''}
                                  onChange={(e) => updateValidation(validation.id, {
                                    config: { ...validation.config, clickVariable: e.target.value }
                                  })}
                                  placeholder="eVar70"
                                  className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                                  readOnly={!!template}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-4">
                          {!template && (
                            <>
                              <button
                                type="button"
                                onClick={() => moveValidation(validation.id, 'up')}
                                disabled={index === 0}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveValidation(validation.id, 'down')}
                                disabled={index === formData.validations.length - 1}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeValidation(validation.id)}
                                className="p-1 text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {errors.submit && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{errors.submit}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-3 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Validation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}