import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { observePointClient } from '../api/client';
import type { WebJourney, WebJourneyAction, Rule } from '../types/observepoint';

// Web Journey Hooks
export const useWebJourneys = () => {
  return useQuery({
    queryKey: ['webJourneys'],
    queryFn: () => observePointClient.getWebJourneys(),
  });
};

export const useWebJourney = (journeyId: string) => {
  return useQuery({
    queryKey: ['webJourney', journeyId],
    queryFn: () => observePointClient.getWebJourney(journeyId),
    enabled: !!journeyId,
  });
};

export const useCreateWebJourney = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (journey: Partial<WebJourney>) => observePointClient.createWebJourney(journey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webJourneys'] });
    },
  });
};

export const useUpdateWebJourney = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ journeyId, updates }: { journeyId: string; updates: Partial<WebJourney> }) =>
      observePointClient.updateWebJourney(journeyId, updates),
    onSuccess: (_, { journeyId }) => {
      queryClient.invalidateQueries({ queryKey: ['webJourney', journeyId] });
      queryClient.invalidateQueries({ queryKey: ['webJourneys'] });
    },
  });
};

export const useDeleteWebJourney = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (journeyId: string) => observePointClient.deleteWebJourney(journeyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webJourneys'] });
    },
  });
};

// Action Hooks
export const useJourneyActions = (journeyId: string) => {
  return useQuery({
    queryKey: ['journeyActions', journeyId],
    queryFn: () => observePointClient.getJourneyActions(journeyId),
    enabled: !!journeyId,
  });
};

export const useAddJourneyAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ journeyId, action }: { journeyId: string; action: Partial<WebJourneyAction> }) =>
      observePointClient.addJourneyAction(journeyId, action),
    onSuccess: (_, { journeyId }) => {
      queryClient.invalidateQueries({ queryKey: ['journeyActions', journeyId] });
    },
  });
};

export const useUpdateJourneyAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ journeyId, actionId, updates }: { journeyId: string; actionId: string; updates: Partial<WebJourneyAction> }) =>
      observePointClient.updateJourneyAction(journeyId, actionId, updates),
    onSuccess: (_, { journeyId }) => {
      queryClient.invalidateQueries({ queryKey: ['journeyActions', journeyId] });
    },
  });
};

export const useDeleteJourneyAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ journeyId, actionId }: { journeyId: string; actionId: string }) =>
      observePointClient.deleteJourneyAction(journeyId, actionId),
    onSuccess: (_, { journeyId }) => {
      queryClient.invalidateQueries({ queryKey: ['journeyActions', journeyId] });
    },
  });
};

// Journey Execution Hooks
export const useRunWebJourney = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (journeyId: string) => observePointClient.runWebJourney(journeyId),
    onSuccess: (_, journeyId) => {
      queryClient.invalidateQueries({ queryKey: ['journeyRuns', journeyId] });
      queryClient.invalidateQueries({ queryKey: ['webJourney', journeyId] });
    },
  });
};

export const useJourneyRuns = (journeyId: string) => {
  return useQuery({
    queryKey: ['journeyRuns', journeyId],
    queryFn: () => observePointClient.getJourneyRuns(journeyId),
    enabled: !!journeyId,
  });
};

export const useJourneyRun = (journeyId: string, runId: string) => {
  return useQuery({
    queryKey: ['journeyRun', journeyId, runId],
    queryFn: () => observePointClient.getJourneyRun(journeyId, runId),
    enabled: !!journeyId && !!runId,
    refetchInterval: (query) => {
      // Poll while the run is still running
      return query.state.data?.status === 'running' ? 5000 : false;
    },
  });
};

// Rule Hooks
export const useRules = () => {
  return useQuery({
    queryKey: ['rules'],
    queryFn: () => observePointClient.getRules(),
  });
};

export const useRule = (ruleId: string) => {
  return useQuery({
    queryKey: ['rule', ruleId],
    queryFn: () => observePointClient.getRule(ruleId),
    enabled: !!ruleId,
  });
};

export const useCreateRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (rule: Partial<Rule>) => observePointClient.createRule(rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
};

export const useUpdateRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ruleId, updates }: { ruleId: string; updates: Partial<Rule> }) =>
      observePointClient.updateRule(ruleId, updates),
    onSuccess: (_, { ruleId }) => {
      queryClient.invalidateQueries({ queryKey: ['rule', ruleId] });
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
};

export const useDeleteRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ruleId: string) => observePointClient.deleteRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
};