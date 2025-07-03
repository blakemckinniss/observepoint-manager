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