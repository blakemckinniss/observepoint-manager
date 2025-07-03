import { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateWebJourney } from '../hooks/useObservePoint';

interface CreateJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateJourneyModal({ isOpen, onClose }: CreateJourneyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');
  
  const createJourney = useCreateWebJourney();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Journey name is required');
      return;
    }

    try {
      await createJourney.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: 'active',
        // Note: The starting URL might need to be added as the first action after journey creation
        // For now, we'll create the journey without it and show a message
      });
      
      // Reset form and close modal
      setFormData({ name: '', description: '' });
      onClose();
      alert('Journey created successfully! You can now add actions to it.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create journey');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Create New Journey</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Journey Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter journey name"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter journey description"
              rows={3}
            />
          </div>


          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createJourney.isPending}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createJourney.isPending ? 'Creating...' : 'Create Journey'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}