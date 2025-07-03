import { useState, useEffect } from 'react';
import { observePointClient } from '../api/client';
import { Key, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

export function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'valid' | 'invalid' | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load existing API key if available (masked)
    const storedKey = localStorage.getItem('observepoint_api_key');
    if (storedKey) {
      setApiKey(maskApiKey(storedKey));
      setKeyStatus('valid'); // Assume valid if stored
    }
  }, []);

  const maskApiKey = (key: string): string => {
    if (key.length <= 8) return key;
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  const handleSaveApiKey = async () => {
    if (!apiKey || apiKey.includes('•')) {
      setMessage('Please enter a valid API key');
      return;
    }

    setIsTestingKey(true);
    setMessage('');
    
    try {
      observePointClient.setApiKey(apiKey);
      const isValid = await observePointClient.testApiKey();
      
      if (isValid) {
        setKeyStatus('valid');
        setMessage('API key saved and validated successfully!');
        setApiKey(maskApiKey(apiKey));
        setShowApiKey(false);
        
        // Reload the page to reinitialize the app with the new API key
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setKeyStatus('invalid');
        setMessage('API key is invalid. Please check and try again.');
        observePointClient.clearApiKey();
      }
    } catch (error) {
      setKeyStatus('invalid');
      setMessage('Failed to validate API key. Please check and try again.');
      observePointClient.clearApiKey();
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleClearApiKey = () => {
    if (confirm('Are you sure you want to remove your API key?')) {
      observePointClient.clearApiKey();
      setApiKey('');
      setKeyStatus(null);
      setMessage('API key removed successfully');
      
      // Reload to reset the app state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleApiKeyChange = (value: string) => {
    // If the user is typing over a masked key, clear it first
    if (apiKey.includes('•')) {
      setApiKey(value);
    } else {
      setApiKey(value);
    }
    setKeyStatus(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">ObservePoint API Configuration</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Configure your ObservePoint API key to access your web journeys and rules.</p>
            <p className="mt-2">
              You can find your API key at{' '}
              <a 
                href="https://app.observepoint.com/my-profile" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-500"
              >
                https://app.observepoint.com/my-profile
              </a>
            </p>
          </div>
          
          <div className="mt-5">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                  API Key
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    name="apiKey"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your ObservePoint API key"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      {showApiKey ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {message && (
              <div className={`mt-3 text-sm ${
                keyStatus === 'valid' ? 'text-green-600' : 
                keyStatus === 'invalid' ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                <div className="flex items-center">
                  {keyStatus === 'valid' && <CheckCircle className="h-4 w-4 mr-1" />}
                  {keyStatus === 'invalid' && <XCircle className="h-4 w-4 mr-1" />}
                  {message}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-5 sm:flex sm:items-center sm:gap-3">
            <button
              type="button"
              onClick={handleSaveApiKey}
              disabled={isTestingKey || !apiKey || (apiKey.includes('•') && keyStatus === 'valid')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTestingKey ? 'Testing...' : 'Save & Test API Key'}
            </button>
            
            {keyStatus === 'valid' && (
              <button
                type="button"
                onClick={handleClearApiKey}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Remove API Key
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900">How to get your API key:</h4>
        <ol className="mt-2 text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Log in to your ObservePoint account</li>
          <li>Navigate to your profile page</li>
          <li>Find the API Key section</li>
          <li>Copy your API key and paste it above</li>
        </ol>
      </div>

      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900">Security Note:</h4>
        <p className="mt-1 text-sm text-gray-600">
          Your API key is stored locally in your browser and is never sent to any server other than ObservePoint's API. 
          The key is used only to authenticate your requests to ObservePoint.
        </p>
      </div>
    </div>
  );
}