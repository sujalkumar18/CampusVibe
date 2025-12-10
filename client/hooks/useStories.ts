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
