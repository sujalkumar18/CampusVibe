import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/query-client';

export type Story = {
  id: string;
  userId: string;
  imageUrl: string;
  caption?: string | null;
  viewCount: number;
  createdAt: string;
  expiresAt: string;
};

export function useStories() {
  return useQuery<{ stories: Story[] }>({
    queryKey: ['api', 'stories'],
    refetchOnMount: true,
    staleTime: 30000,
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { userId: string; imageUrl: string; caption?: string }) => {
      const res = await apiRequest('POST', '/api/stories', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'stories'] });
    },
  });
}

export function useViewStory() {
  return useMutation({
    mutationFn: async (storyId: string) => {
      const res = await apiRequest('POST', `/api/stories/${storyId}/view`);
      return res.json();
    },
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ storyId, userId }: { storyId: string; userId: string }) => {
      const res = await apiRequest('DELETE', `/api/stories/${storyId}`, { userId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'stories'] });
    },
  });
}

export function useUserStories(userId: string | undefined) {
  return useQuery<{ stories: Story[] }>({
    queryKey: ['api', 'users', userId, 'stories'],
    enabled: !!userId,
    refetchOnMount: true,
  });
}
