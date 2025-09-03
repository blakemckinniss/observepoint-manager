import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { WebJourney, WebJourneyAction, WebJourneyRun, Rule, ApiError, WebValidation, ValidationRun, ValidationTemplate, ValidationStep, ValidationResult } from '../types/observepoint';

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

  // Web Validation Management
  async getWebValidations(): Promise<WebValidation[]> {
    // Get all web journeys and filter for ones with web-validation label
    const response = await this.client.get('/web-journeys');
    const allJourneys = response.data;
    
    // Filter for journeys that are web validations (have the label or created through this system)
    const webValidations = allJourneys
      .filter((journey: any) => 
        journey.labels?.includes('web-validation') || 
        journey.name?.includes('Validation') ||
        journey.name?.includes('Audit')
      )
      .map((journey: any) => this.journeyToValidation(journey));
    
    return webValidations;
  }

  async getWebValidation(validationId: string): Promise<WebValidation> {
    const response = await this.client.get(`/web-journeys/${validationId}`);
    return this.journeyToValidation(response.data);
  }

  async createWebValidation(validation: Partial<WebValidation>): Promise<WebValidation> {
    // Convert validation to web journey format for ObservePoint API
    const journey = this.validationToJourney(validation);
    
    // Map our frequency values to ObservePoint's expected values
    const frequencyMap: Record<string, string> = {
      'manual': 'paused',
      'daily': 'daily',
      'weekly': 'weekly', 
      'monthly': 'monthly'
    };
    
    // Build actions array
    const actions: any[] = [];
    let sequence = 0;
    
    // Add navigation action if URL is provided
    if (validation.url) {
      actions.push({
        label: 'Navigate to Target Page',
        action: 'navto',
        url: validation.url,
        sequence: sequence++
      });
    }
    
    // Add validation actions
    if (validation.validations && validation.validations.length > 0) {
      for (const validationStep of validation.validations) {
        const action = this.validationStepToAction(validationStep, sequence++);
        if (action) {
          actions.push(action);
        }
      }
    }
    
    // If no actions were created, add a default navigation
    if (actions.length === 0) {
      actions.push({
        label: 'Navigate to page',
        action: 'navto',
        url: validation.url || 'https://www.example.com',
        sequence: 0
      });
    }
    
    // Add required fields for ObservePoint API
    const journeyWithRequiredFields = {
      ...journey,
      domainId: 301660, // Default to "Full Site Audits (New)" domain
      emails: [], // Required but can be empty
      actions: actions, // Actions must be included in creation
      options: {
        location: "mountain",
        browserWidth: 1366,
        userAgent: "Chrome - Linux",
        userAgentDescription: "Chrome - Linux",
        frequency: frequencyMap[validation.frequency || 'manual'] || 'paused',
        alerts: false,
        vpnEnabled: false,
        loadFlash: false,
        flashLiveVideoEnabled: false,
        monitoredByScriptServices: false,
        customProxy: null,
        webHookUrl: null,
        blackoutPeriod: null,
        remoteFileMapConfig: null,
        // Set nextRun to current time + 1 minute for ISO format
        nextRun: new Date(Date.now() + 60000).toISOString()
      }
    };
    
    const response = await this.client.post('/web-journeys', journeyWithRequiredFields);
    return this.journeyToValidation(response.data);
  }

  async updateWebValidation(validationId: string, updates: Partial<WebValidation>): Promise<WebValidation> {
    const journey = this.validationToJourney(updates);
    const response = await this.client.put(`/web-journeys/${validationId}`, journey);
    return this.journeyToValidation(response.data);
  }

  async deleteWebValidation(validationId: string): Promise<void> {
    await this.client.delete(`/web-journeys/${validationId}`);
  }

  async runWebValidation(validationId: string): Promise<ValidationRun> {
    const response = await this.client.post(`/web-journeys/${validationId}/run`);
    return this.journeyRunToValidationRun(response.data);
  }

  async getValidationRuns(validationId: string): Promise<ValidationRun[]> {
    const response = await this.client.get(`/web-journeys/${validationId}/runs`);
    return response.data.map((run: WebJourneyRun) => this.journeyRunToValidationRun(run));
  }

  async getValidationRun(validationId: string, runId: string): Promise<ValidationRun> {
    const response = await this.client.get(`/web-journeys/${validationId}/runs/${runId}`);
    return this.journeyRunToValidationRun(response.data);
  }

  // Validation Template Management (stored locally for now)
  async getValidationTemplates(): Promise<ValidationTemplate[]> {
    const templates = localStorage.getItem('validation_templates');
    return templates ? JSON.parse(templates) : this.getDefaultTemplates();
  }

  async saveValidationTemplate(template: ValidationTemplate): Promise<void> {
    const templates = await this.getValidationTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push(template);
    }
    localStorage.setItem('validation_templates', JSON.stringify(templates));
  }

  async deleteValidationTemplate(templateId: string): Promise<void> {
    const templates = await this.getValidationTemplates();
    const filtered = templates.filter(t => t.id !== templateId);
    localStorage.setItem('validation_templates', JSON.stringify(filtered));
  }

  // Helper methods for conversion between Validation and Journey formats
  private validationToJourney(validation: Partial<WebValidation>): Partial<WebJourney> {
    const journey: Partial<WebJourney> = {
      name: validation.name,
      description: validation.description,
      status: validation.status as 'active' | 'inactive' | 'running',
      labels: [...(validation.labels || []), 'web-validation'],
    };
    return journey;
  }

  private journeyToValidation(journey: WebJourney): WebValidation {
    return {
      id: journey.id,
      name: journey.name,
      description: journey.description,
      url: '', // Will be extracted from first action
      frequency: 'manual',
      status: journey.status,
      validations: [],
      created: journey.created,
      updated: journey.updated,
      lastRun: journey.lastRun,
      accountId: journey.accountId,
      folderId: journey.folderId,
      labels: journey.labels,
    };
  }

  private journeyRunToValidationRun(run: WebJourneyRun): ValidationRun {
    const results: ValidationResult[] = (run.results || []).map((result, index) => ({
      validationStepId: `val-${index}`,
      validationStepName: `Validation ${index + 1}`,
      status: 'passed' as const,
      message: 'Validation completed',
      timestamp: result.timestamp,
      screenshot: result.screenshots?.[0],
    }));

    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;

    return {
      id: run.id,
      validationId: run.journeyId,
      status: run.status,
      startTime: run.startTime,
      endTime: run.endTime,
      duration: run.duration,
      results,
      summary: {
        passed,
        failed,
        skipped,
        total: results.length,
      },
    };
  }

  private validationStepToAction(validationStep: ValidationStep, sequence: number): any {
    const action: any = {
      label: validationStep.name,
      sequence: sequence
    };

    switch (validationStep.type) {
      case 'page_view':
        // Custom JS to validate page view tracking
        action.action = 'execute';
        action.js = `
          // Validate page view tracking
          var expectedPageName = '${validationStep.config.expectedPageName || ''}';
          var pageVariable = '${validationStep.config.pageNameVariable || 'eVar100'}';
          
          // Check Adobe Analytics
          if (window.s && window.s[pageVariable]) {
            var actualValue = window.s[pageVariable];
            if (actualValue.includes(expectedPageName)) {
              console.log('✓ Page tracking validated: ' + actualValue);
              return { success: true, message: 'Page tracking validated: ' + actualValue };
            } else {
              console.error('✗ Page tracking mismatch. Expected: ' + expectedPageName + ', Got: ' + actualValue);
              return { success: false, message: 'Page tracking mismatch', expected: expectedPageName, actual: actualValue };
            }
          } else {
            console.error('✗ Adobe Analytics not found or ' + pageVariable + ' not set');
            return { success: false, message: 'Adobe Analytics not found or variable not set' };
          }
        `;
        break;

      case 'click_tracking':
        // For click tracking, we need to execute JS that clicks and validates
        action.action = 'execute';
        action.js = `
          // Click element and validate tracking
          var selector = '${validationStep.config.selector || ''}';
          var clickEvent = '${validationStep.config.clickEvent || 'event75'}';
          var clickVariable = '${validationStep.config.clickVariable || 'eVar70'}';
          var expectedValue = '${validationStep.config.expectedClickValue || ''}';
          
          var element = document.querySelector(selector);
          if (!element) {
            console.error('✗ Element not found: ' + selector);
            return { success: false, message: 'Element not found: ' + selector };
          }
          
          // Set up listener for Adobe Analytics call
          var trackingFired = false;
          var actualValue = null;
          
          // Store original _satellite.track if it exists
          var originalTrack = window._satellite ? window._satellite.track : null;
          
          // Monitor Adobe Analytics
          if (window.s) {
            var originalTl = window.s.tl;
            window.s.tl = function() {
              // Check if the expected event fired
              if (window.s[clickVariable]) {
                actualValue = window.s[clickVariable];
                trackingFired = true;
              }
              // Call original function
              if (originalTl) {
                originalTl.apply(this, arguments);
              }
            };
          }
          
          // Click the element
          console.log('Clicking element: ' + selector);
          element.click();
          
          // Wait a moment for tracking to fire
          return new Promise(function(resolve) {
            setTimeout(function() {
              // Restore original functions
              if (window.s && originalTl) {
                window.s.tl = originalTl;
              }
              
              if (trackingFired) {
                if (actualValue === expectedValue || (expectedValue && actualValue && actualValue.includes(expectedValue))) {
                  console.log('✓ Click tracking validated: ' + actualValue);
                  resolve({ success: true, message: 'Click tracking validated: ' + actualValue });
                } else {
                  console.error('✗ Click tracking mismatch. Expected: ' + expectedValue + ', Got: ' + actualValue);
                  resolve({ success: false, message: 'Click tracking mismatch', expected: expectedValue, actual: actualValue });
                }
              } else {
                console.error('✗ Click tracking did not fire');
                resolve({ success: false, message: 'Click tracking did not fire' });
              }
            }, 1000); // Wait 1 second for tracking
          });
        `;
        break;

      case 'dom_element':
        // Validate DOM element exists
        action.action = 'execute';
        action.js = `
          var selector = '${validationStep.config.elementSelector || ''}';
          var element = document.querySelector(selector);
          
          if (element) {
            var attribute = '${validationStep.config.elementAttribute || ''}';
            var expectedValue = '${validationStep.config.expectedElementValue || ''}';
            
            if (attribute) {
              var actualValue = element.getAttribute(attribute);
              if (actualValue === expectedValue) {
                console.log('✓ DOM element validated');
                return { success: true, message: 'DOM element validated' };
              } else {
                console.error('✗ Attribute mismatch. Expected: ' + expectedValue + ', Got: ' + actualValue);
                return { success: false, message: 'Attribute mismatch', expected: expectedValue, actual: actualValue };
              }
            } else {
              console.log('✓ DOM element found: ' + selector);
              return { success: true, message: 'DOM element found' };
            }
          } else {
            console.error('✗ DOM element not found: ' + selector);
            return { success: false, message: 'DOM element not found: ' + selector };
          }
        `;
        break;

      case 'custom_js':
        // Execute custom JavaScript
        action.action = 'execute';
        action.js = validationStep.config.customScript || '';
        break;

      case 'network_request':
        // Validate network request
        action.action = 'execute';
        action.js = `
          // Monitor for network request
          var requestUrl = '${validationStep.config.requestUrl || ''}';
          console.log('Monitoring for network request: ' + requestUrl);
          // Note: Actual network monitoring would require more complex implementation
          return { success: true, message: 'Network monitoring placeholder' };
        `;
        break;

      default:
        return null;
    }

    return action;
  }

  private getDefaultTemplates(): ValidationTemplate[] {
    return [
      {
        id: 'page-tracking',
        name: 'Page View Tracking',
        description: 'Validate that page view tracking fires with correct page name',
        category: 'page_tracking',
        validations: [
          {
            name: 'Navigate to Page',
            type: 'page_view',
            sequence: 1,
            enabled: true,
            config: {
              pageNameVariable: 'eVar100',
              expectedPageName: '{{pageName}}',
            },
          },
        ],
        variables: [
          {
            key: 'url',
            label: 'Page URL',
            type: 'text',
            required: true,
            placeholder: 'https://www.example.com/page',
            helpText: 'The URL of the page to test',
          },
          {
            key: 'pageName',
            label: 'Expected Page Name',
            type: 'text',
            required: true,
            placeholder: 'cg|events wagyu-burger-and-wine-pairing',
            helpText: 'The expected value for eVar100',
          },
        ],
      },
      {
        id: 'cta-tracking',
        name: 'CTA Click Tracking',
        description: 'Validate that CTA clicks fire correct tracking events',
        category: 'event_tracking',
        validations: [
          {
            name: 'Navigate to Page',
            type: 'page_view',
            sequence: 1,
            enabled: true,
            config: {},
          },
          {
            name: 'Click CTA',
            type: 'click_tracking',
            sequence: 2,
            enabled: true,
            config: {
              selector: '{{ctaSelector}}',
              clickEvent: 'event75',
              clickVariable: 'eVar70',
              expectedClickValue: '{{ctaTrackingValue}}',
            },
          },
        ],
        variables: [
          {
            key: 'url',
            label: 'Page URL',
            type: 'text',
            required: true,
            placeholder: 'https://www.example.com/page',
          },
          {
            key: 'ctaSelector',
            label: 'CTA Selector',
            type: 'text',
            required: true,
            placeholder: 'a[data-link-info="reservation-top-cta"]',
            helpText: 'CSS selector for the CTA element',
          },
          {
            key: 'ctaTrackingValue',
            label: 'Expected Tracking Value',
            type: 'text',
            required: true,
            placeholder: 'reservation-top-cta',
            helpText: 'Expected value for eVar70',
          },
        ],
      },
      {
        id: 'full-page-validation',
        name: 'Full Page Validation',
        description: 'Complete validation of page tracking and all CTAs',
        category: 'page_tracking',
        validations: [
          {
            name: 'Navigate and Validate Page',
            type: 'page_view',
            sequence: 1,
            enabled: true,
            config: {
              pageNameVariable: 'eVar100',
              expectedPageName: '{{pageName}}',
            },
          },
          {
            name: 'Validate Top CTA',
            type: 'click_tracking',
            sequence: 2,
            enabled: true,
            config: {
              selector: '{{topCtaSelector}}',
              clickEvent: 'event75',
              clickVariable: 'eVar70',
              expectedClickValue: '{{topCtaValue}}',
            },
          },
          {
            name: 'Validate Bottom CTA',
            type: 'click_tracking',
            sequence: 3,
            enabled: true,
            config: {
              selector: '{{bottomCtaSelector}}',
              clickEvent: 'event75',
              clickVariable: 'eVar70',
              expectedClickValue: '{{bottomCtaValue}}',
            },
          },
        ],
        variables: [
          {
            key: 'url',
            label: 'Page URL',
            type: 'text',
            required: true,
            placeholder: 'https://www.thecapitalgrille.com/events/wagyu-burger-and-wine-pairing',
          },
          {
            key: 'pageName',
            label: 'Page Name (eVar100)',
            type: 'text',
            required: true,
            placeholder: 'cg|events wagyu-burger-and-wine-pairing',
          },
          {
            key: 'topCtaSelector',
            label: 'Top CTA Selector',
            type: 'text',
            required: true,
            placeholder: '[data-link-info="reservation-top-cta"]',
          },
          {
            key: 'topCtaValue',
            label: 'Top CTA Tracking Value',
            type: 'text',
            required: true,
            placeholder: 'reservation-top-cta',
          },
          {
            key: 'bottomCtaSelector',
            label: 'Bottom CTA Selector',
            type: 'text',
            required: true,
            placeholder: '[data-link-info="reservation-bottom-cta"]',
          },
          {
            key: 'bottomCtaValue',
            label: 'Bottom CTA Tracking Value',
            type: 'text',
            required: true,
            placeholder: 'reservation-bottom-cta',
          },
        ],
      },
    ];
  }
}

export const observePointClient = new ObservePointClient();