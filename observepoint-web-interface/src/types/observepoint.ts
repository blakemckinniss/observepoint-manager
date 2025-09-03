export interface WebJourney {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'running';
  created: string;
  updated: string;
  lastRun?: string;
  accountId: string;
  folderId?: string;
  labels?: string[];
}

export interface WebJourneyAction {
  actionId: number;
  label: string;
  sequence: number;
  action: 'navto' | 'execute' | 'click' | 'input' | 'wait' | 'scroll';
  url?: string;
  js?: string;
  selector?: string;
  value?: string;
  waitDuration?: number;
  preventNavigation?: boolean;
  rules: number[];
}

export interface WebJourneyRun {
  id: string;
  journeyId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  duration?: number;
  results?: WebJourneyResult[];
  error?: string;
}

export interface WebJourneyResult {
  id: string;
  runId: string;
  pageUrl: string;
  timestamp: string;
  screenshots?: string[];
  networkRequests?: NetworkRequest[];
  consoleMessages?: ConsoleMessage[];
  tagsFired?: Tag[];
}

export interface NetworkRequest {
  url: string;
  method: string;
  status: number;
  type: string;
  size: number;
  timing: number;
}

export interface ConsoleMessage {
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: string;
}

export interface Tag {
  name: string;
  type: string;
  fired: boolean;
  parameters: Record<string, any>;
}

export interface Rule {
  id: string;
  name: string;
  description?: string;
  type: 'tag_present' | 'tag_not_present' | 'variable_value' | 'request_present' | 'custom';
  condition: RuleCondition;
  journeyIds: string[];
  enabled: boolean;
}

export interface RuleCondition {
  tagName?: string;
  variableName?: string;
  expectedValue?: string;
  operator?: 'equals' | 'contains' | 'regex' | 'not_equals';
  customScript?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// Web Validation types
export interface WebValidation {
  id: string;
  name: string;
  description?: string;
  url: string;
  frequency: 'manual' | 'daily' | 'weekly' | 'monthly';
  status: 'active' | 'inactive' | 'running';
  templateId?: string;
  validations: ValidationStep[];
  created: string;
  updated: string;
  lastRun?: string;
  accountId: string;
  folderId?: string;
  labels?: string[];
}

export interface ValidationStep {
  id: string;
  name: string;
  type: 'page_view' | 'click_tracking' | 'dom_element' | 'network_request' | 'custom_js';
  sequence: number;
  enabled: boolean;
  config: ValidationConfig;
}

export interface ValidationConfig {
  // For page view validation
  pageNameVariable?: string;
  expectedPageName?: string;
  
  // For click tracking validation
  selector?: string;
  clickEvent?: string;
  clickVariable?: string;
  expectedClickValue?: string;
  
  // For DOM element validation
  elementSelector?: string;
  elementAttribute?: string;
  expectedElementValue?: string;
  
  // For network request validation
  requestUrl?: string;
  requestMethod?: string;
  requestParams?: Record<string, any>;
  
  // For custom JS validation
  customScript?: string;
  expectedResult?: any;
}

export interface ValidationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'page_tracking' | 'event_tracking' | 'form_tracking' | 'custom';
  validations: Omit<ValidationStep, 'id'>[];
  variables: TemplateVariable[];
}

export interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'select' | 'boolean' | 'number';
  required: boolean;
  defaultValue?: any;
  options?: { value: string; label: string }[];
  placeholder?: string;
  helpText?: string;
}

export interface ValidationRun {
  id: string;
  validationId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  duration?: number;
  results: ValidationResult[];
  summary: {
    passed: number;
    failed: number;
    skipped: number;
    total: number;
  };
}

export interface ValidationResult {
  validationStepId: string;
  validationStepName: string;
  status: 'passed' | 'failed' | 'skipped';
  message?: string;
  details?: any;
  screenshot?: string;
  timestamp: string;
}