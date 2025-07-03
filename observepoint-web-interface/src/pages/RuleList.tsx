import { useState } from 'react';
import { useRules, useCreateRule, useUpdateRule, useDeleteRule } from '../hooks/useObservePoint';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Code, Tag, Variable, Globe } from 'lucide-react';
import type { Rule, RuleCondition } from '../types/observepoint';
import { ApiKeyGuard } from '../components/ApiKeyGuard';

export function RuleList() {
  const { data: rules, isLoading, error } = useRules();
  const createRule = useCreateRule();
  const updateRule = useUpdateRule();
  const deleteRule = useDeleteRule();

  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRule, setNewRule] = useState<Partial<Rule>>({
    name: '',
    type: 'tag_present',
    enabled: true,
    condition: {},
    journeyIds: [],
  });

  const handleCreateRule = async () => {
    try {
      await createRule.mutateAsync(newRule);
      setIsAddingRule(false);
      setNewRule({
        name: '',
        type: 'tag_present',
        enabled: true,
        condition: {},
        journeyIds: [],
      });
    } catch (error) {
      alert('Failed to create rule: ' + error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      await deleteRule.mutateAsync(ruleId);
    } catch (error) {
      alert('Failed to delete rule: ' + error);
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      await updateRule.mutateAsync({ ruleId, updates: { enabled } });
    } catch (error) {
      alert('Failed to update rule: ' + error);
    }
  };

  const getRuleIcon = (type: Rule['type']) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'tag_present':
      case 'tag_not_present':
        return <Tag className={iconClass} />;
      case 'variable_value':
        return <Variable className={iconClass} />;
      case 'request_present':
        return <Globe className={iconClass} />;
      case 'custom':
        return <Code className={iconClass} />;
      default:
        return null;
    }
  };

  const getRuleDescription = (rule: Rule) => {
    switch (rule.type) {
      case 'tag_present':
        return `Tag "${rule.condition.tagName}" must be present`;
      case 'tag_not_present':
        return `Tag "${rule.condition.tagName}" must not be present`;
      case 'variable_value':
        return `Variable "${rule.condition.variableName}" ${rule.condition.operator} "${rule.condition.expectedValue}"`;
      case 'request_present':
        return `Network request matching pattern must be present`;
      case 'custom':
        return `Custom JavaScript rule`;
      default:
        return rule.description || 'No description';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading rules: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <ApiKeyGuard>
      <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Rules</h1>
          <p className="mt-2 text-sm text-gray-700">
            Define validation rules to ensure your web journeys are working correctly.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setIsAddingRule(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Rule
          </button>
        </div>
      </div>

      {isAddingRule && (
        <div className="mt-6 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Create New Rule</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., Check Analytics Tag"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Rule Type</label>
                <select
                  value={newRule.type}
                  onChange={(e) => setNewRule({ ...newRule, type: e.target.value as Rule['type'] })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="tag_present">Tag Must Be Present</option>
                  <option value="tag_not_present">Tag Must Not Be Present</option>
                  <option value="variable_value">Variable Value Check</option>
                  <option value="request_present">Request Must Be Present</option>
                  <option value="custom">Custom JavaScript</option>
                </select>
              </div>

              {(newRule.type === 'tag_present' || newRule.type === 'tag_not_present') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tag Name</label>
                  <input
                    type="text"
                    value={newRule.condition?.tagName || ''}
                    onChange={(e) => setNewRule({ 
                      ...newRule, 
                      condition: { ...newRule.condition, tagName: e.target.value }
                    })}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g., Google Analytics"
                  />
                </div>
              )}

              {newRule.type === 'variable_value' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Variable Name</label>
                    <input
                      type="text"
                      value={newRule.condition?.variableName || ''}
                      onChange={(e) => setNewRule({ 
                        ...newRule, 
                        condition: { ...newRule.condition, variableName: e.target.value }
                      })}
                      className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="e.g., dataLayer.page.type"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Operator</label>
                    <select
                      value={newRule.condition?.operator || 'equals'}
                      onChange={(e) => setNewRule({ 
                        ...newRule, 
                        condition: { ...newRule.condition, operator: e.target.value as RuleCondition['operator'] }
                      })}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="equals">Equals</option>
                      <option value="contains">Contains</option>
                      <option value="regex">Regex Match</option>
                      <option value="not_equals">Not Equals</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expected Value</label>
                    <input
                      type="text"
                      value={newRule.condition?.expectedValue || ''}
                      onChange={(e) => setNewRule({ 
                        ...newRule, 
                        condition: { ...newRule.condition, expectedValue: e.target.value }
                      })}
                      className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="e.g., homepage"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea
                  value={newRule.description || ''}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  rows={2}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Describe what this rule validates..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCreateRule}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create Rule
                </button>
                <button
                  onClick={() => {
                    setIsAddingRule(false);
                    setNewRule({
                      name: '',
                      type: 'tag_present',
                      enabled: true,
                      condition: {},
                      journeyIds: [],
                    });
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Type
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Description
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {rules?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-sm text-gray-500 text-center">
                        No rules defined yet. Create your first rule to start validating your web journeys.
                      </td>
                    </tr>
                  ) : (
                    rules?.map((rule) => (
                      <tr key={rule.id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            {getRuleIcon(rule.type)}
                            <span className="ml-2">{rule.type?.replace(/_/g, ' ') || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                          {rule.name}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {getRuleDescription(rule)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <button
                            onClick={() => handleToggleRule(rule.id, !rule.enabled)}
                            className="inline-flex items-center"
                          >
                            {rule.enabled ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-gray-400" />
                            )}
                            <span className="ml-2">{rule.enabled ? 'Enabled' : 'Disabled'}</span>
                          </button>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit Rule"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRule(rule.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Rule"
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
    </ApiKeyGuard>
  );
}