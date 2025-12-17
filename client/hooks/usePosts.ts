import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/query-client';

type Category = 'confession' | 'crush' | 'meme' | 'rant' | 'compliment';

export type Post = {
  id: string;
  userId: string;
  content: string;
  category: Category;
  imageUrl?: string | null;
  videoUrl?: string | null;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: string;
};

export function usePosts(category?: Category) {
  return useQuery<{ posts: Post[] }>({
    queryKey: category ? ['api', 'posts', `?category=${category}`] : ['api', 'posts'],
    refetchOnMount: true,
    staleTime: 30000,
  });
}

export function usePost(postId: string) {
  return useQuery<{ post: Post }>({
    queryKey: ['api', 'posts', postId],
    enabled: !!postId,
  });
}

export function useUserPosts(userId: string | undefined) {
  return useQuery<{ posts: Post[] }>({
    queryKey: ['api', 'users', userId, 'posts'],
    enabled: !!userId,
    refetchOnMount: true,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { userId: string; content: string; category: Category; imageUrl?: string; videoUrl?: string; expiresInHours?: number }) => {
      const res = await apiRequest('POST', '/api/posts', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'posts'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, userId }: { postId: string; userId: string }) => {
      const res = await apiRequest('DELETE', `/api/posts/${postId}?userId=${encodeURIComponent(userId)}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'posts'] });
    },
  });
}

export function useVote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { userId: string; postId?: string; commentId?: string; voteType: 1 | -1 }) => {
      const res = await apiRequest('POST', '/api/vote', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'posts'] });
    },
  });
}
