import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { WebJourney, WebJourneyAction, WebJourneyRun, Rule, ApiError } from '../types/observepoint';

class ObservePointClient {
  private client!: AxiosInstance;
  private apiKey: string | null = null;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    // First check localStorage, then environment variable
    const storedApiKey = localStorage.getItem('observepoint_api_key');
    const envApiKey = import.meta.env.VITE_OBSERVEPOINT_API_KEY;
    this.apiKey = storedApiKey || envApiKey || null;
    
    const baseURL = import.meta.env.VITE_OBSERVEPOINT_API_BASE_URL || 'https://api.observepoint.com/v2';

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include API key if available
    this.client.interceptors.request.use(
      (config) => {
        if (this.apiKey) {
          config.headers['Authorization'] = `api_key ${this.apiKey}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          throw new Error('Invalid API key. Please check your ObservePoint API key in Settings.');
        }
        if (error.response?.data) {
          throw new Error(error.response.data.message || 'API request failed');
        }
        throw error;
      }
    );
  }

  // API Key Management
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('observepoint_api_key', apiKey);
    this.initializeClient(); // Reinitialize client with new API key
  }

  clearApiKey() {
    this.apiKey = null;
    localStorage.removeItem('observepoint_api_key');
    this.initializeClient();
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  // Test API key validity
  async testApiKey(): Promise<boolean> {
    try {
      await this.client.get('/web-journeys?size=1');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Web Journey Management
  async getWebJourneys(): Promise<WebJourney[]> {
    const response = await this.client.get('/web-journeys');
    return response.data;
  }

  async getWebJourney(journeyId: string): Promise<WebJourney> {
    const response = await this.client.get(`/web-journeys/${journeyId}`);
    return response.data;
  }

  async createWebJourney(journey: Partial<WebJourney>): Promise<WebJourney> {
    const response = await this.client.post('/web-journeys', journey);
    return response.data;
  }

  async updateWebJourney(journeyId: string, updates: Partial<WebJourney>): Promise<WebJourney> {
    const response = await this.client.put(`/web-journeys/${journeyId}`, updates);
    return response.data;
  }

  async deleteWebJourney(journeyId: string): Promise<void> {
    await this.client.delete(`/web-journeys/${journeyId}`);
  }

  // Action Management
  async getJourneyActions(journeyId: string): Promise<WebJourneyAction[]> {
    const response = await this.client.get(`/web-journeys/${journeyId}/actions`);
    return response.data;
  }

  async addJourneyAction(journeyId: string, action: Partial<WebJourneyAction>): Promise<WebJourneyAction> {
    const response = await this.client.post(`/web-journeys/${journeyId}/actions`, action);
    return response.data;
  }

  async updateJourneyAction(journeyId: string, actionId: string, updates: Partial<WebJourneyAction>): Promise<WebJourneyAction> {
    const response = await this.client.put(`/web-journeys/${journeyId}/actions/${actionId}`, updates);
    return response.data;
  }

  async deleteJourneyAction(journeyId: string, actionId: string): Promise<void> {
    await this.client.delete(`/web-journeys/${journeyId}/actions/${actionId}`);
  }

  async reorderJourneyActions(journeyId: string, actionIds: string[]): Promise<void> {
    await this.client.put(`/web-journeys/${journeyId}/actions/order`, { actionIds });
  }

  // Journey Execution
  async runWebJourney(journeyId: string): Promise<WebJourneyRun> {
    const response = await this.client.post(`/web-journeys/${journeyId}/run`);
    return response.data;
  }

  async getJourneyRuns(journeyId: string): Promise<WebJourneyRun[]> {
    const response = await this.client.get(`/web-journeys/${journeyId}/runs`);
    return response.data;
  }

  async getJourneyRun(journeyId: string, runId: string): Promise<WebJourneyRun> {
    const response = await this.client.get(`/web-journeys/${journeyId}/runs/${runId}`);
    return response.data;
  }

  async stopJourneyRun(journeyId: string, runId: string): Promise<void> {
    await this.client.post(`/web-journeys/${journeyId}/runs/${runId}/stop`);
  }

  // Rule Management
  async getRules(): Promise<Rule[]> {
    const response = await this.client.get('/rules');
    return response.data;
  }

  async getRule(ruleId: string): Promise<Rule> {
    const response = await this.client.get(`/rules/${ruleId}`);
    return response.data;
  }

  async createRule(rule: Partial<Rule>): Promise<Rule> {
    const response = await this.client.post('/rules', rule);
    return response.data;
  }

  async updateRule(ruleId: string, updates: Partial<Rule>): Promise<Rule> {
    const response = await this.client.put(`/rules/${ruleId}`, updates);
    return response.data;
  }

  async deleteRule(ruleId: string): Promise<void> {
    await this.client.delete(`/rules/${ruleId}`);
  }

  async assignRuleToJourney(ruleId: string, journeyId: string): Promise<void> {
    await this.client.post(`/rules/${ruleId}/journeys/${journeyId}`);
  }

  async removeRuleFromJourney(ruleId: string, journeyId: string): Promise<void> {
    await this.client.delete(`/rules/${ruleId}/journeys/${journeyId}`);
  }
}

export const observePointClient = new ObservePointClient();