import { useMutation } from '@tanstack/react-query';
import { getApiBaseUrl } from '@/lib/query-client';

export function useUpload() {
  return useMutation({
    mutationFn: async (file: { uri: string; type?: string; name?: string }) => {
      const baseUrl = getApiBaseUrl();
      const formData = new FormData();
      
      const fileType = file.type || (file.uri.includes('.mp4') || file.uri.includes('.mov') ? 'video/mp4' : 'image/jpeg');
      const fileName = file.name || `file-${Date.now()}.${fileType.includes('video') ? 'mp4' : 'jpg'}`;
      
      formData.append('file', {
        uri: file.uri,
        type: fileType,
        name: fileName,
      } as any);
      
      const response = await fetch(`${baseUrl}/api/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json() as Promise<{ url: string; filename: string }>;
    },
  });
}
