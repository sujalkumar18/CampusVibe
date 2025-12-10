import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/query-client';

export type Comment = {
  id: string;
  postId: string;
  userId: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
};

export function useComments(postId: string) {
  return useQuery<{ comments: Comment[] }>({
    queryKey: ['api', 'posts', postId, 'comments'],
    enabled: !!postId,
    refetchOnMount: true,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { userId: string; postId: string; content: string }) => {
      const res = await apiRequest('POST', '/api/comments', data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['api', 'posts', variables.postId, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['api', 'posts'] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commentId, userId, postId }: { commentId: string; userId: string; postId: string }) => {
      const res = await apiRequest('DELETE', `/api/comments/${commentId}`, { userId });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['api', 'posts', variables.postId, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['api', 'posts'] });
    },
  });
}
