import { useMutation, useQueryClient } from '@tanstack/react-query';

import { videoKeys } from '../api/videoQueries';
import { importVideo, syncVideo } from '../api/videos';

export const useImportVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importVideo,
    onSuccess: async (video) => {
      queryClient.setQueryData(videoKeys.detail(video.id), video);
      await queryClient.invalidateQueries({ queryKey: videoKeys.lists() });
    },
  });
};

export const useSyncVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncVideo,
    onSuccess: async (video) => {
      queryClient.setQueryData(videoKeys.detail(video.id), video);
      await queryClient.invalidateQueries({ queryKey: videoKeys.lists() });
    },
  });
};
