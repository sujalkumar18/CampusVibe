import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/query-client';
import type { Category } from '../../shared/schema';

export type PollOption = {
  id: string;
  pollId: string;
  optionText: string;
  voteCount: number;
};

export type Poll = {
  id: string;
  userId: string;
  question: string;
  category: Category;
  totalVotes: number;
  createdAt: string;
  expiresAt: string | null;
  options: PollOption[];
  userVotedOptionId?: string | null;
};

export function usePolls(category?: Category) {
  return useQuery<{ polls: Poll[] }>({
    queryKey: category ? ['api', 'polls', `?category=${category}`] : ['api', 'polls'],
    refetchOnMount: true,
    staleTime: 30000,
  });
}

export function useCreatePoll() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      userId: string; 
      question: string;
      category: Category;
      options: string[];
      expiresInHours?: number;
    }) => {
      const res = await apiRequest('POST', '/api/polls', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'polls'] });
    },
  });
}

export function useVotePoll() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      pollId: string;
      optionId: string;
      userId: string;
    }) => {
      const res = await apiRequest('POST', '/api/polls/vote', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'polls'] });
    },
  });
}

export function useDeletePoll() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ pollId, userId }: { pollId: string; userId: string }) => {
      const res = await apiRequest('DELETE', `/api/polls/${pollId}`, { userId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'polls'] });
    },
  });
}
