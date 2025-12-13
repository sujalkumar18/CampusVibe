import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/query-client';

type Category = 'confession' | 'crush' | 'meme' | 'rant' | 'compliment';

export type Reel = {
  id: string;
  userId: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  description?: string | null;
  category: Category;
  upvotes: number;
  downvotes: number;
  viewCount: number;
  createdAt: string;
};

export function useReels(category?: Category) {
  return useQuery<{ reels: Reel[] }>({
    queryKey: category ? ['api', 'reels', `?category=${category}`] : ['api', 'reels'],
    refetchOnMount: true,
    staleTime: 30000,
  });
}

export function useReel(reelId: string) {
  return useQuery<{ reel: Reel }>({
    queryKey: ['api', 'reels', reelId],
    enabled: !!reelId,
  });
}

export function useCreateReel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      userId: string; 
      videoUrl: string; 
      thumbnailUrl?: string; 
      description?: string; 
      category: Category 
    }) => {
      const res = await apiRequest('POST', '/api/reels', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'reels'] });
    },
  });
}

export function useDeleteReel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ reelId, userId }: { reelId: string; userId: string }) => {
      const res = await apiRequest('DELETE', `/api/reels/${reelId}`, { userId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'reels'] });
    },
  });
}

export function useViewReel() {
  return useMutation({
    mutationFn: async (reelId: string) => {
      const res = await apiRequest('POST', `/api/reels/${reelId}/view`);
      return res.json();
    },
  });
}
