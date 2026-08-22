"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useUploadProgressTracker() {
  const activeUploadsRef = useRef(0);
  const [uploadsInProgress, setUploadsInProgress] = useState(0);

  const trackUpload = useCallback((uploading: boolean) => {
    activeUploadsRef.current = Math.max(
      0,
      activeUploadsRef.current + (uploading ? 1 : -1),
    );
    setUploadsInProgress(activeUploadsRef.current);
  }, []);

  const resetUploads = useCallback(() => {
    activeUploadsRef.current = 0;
    setUploadsInProgress(0);
  }, []);

  return { uploadsInProgress, trackUpload, resetUploads };
}

export function useNotifyUploadingChange(
  onUploadingChange?: (uploading: boolean) => void,
) {
  const previousValueRef = useRef<boolean | null>(null);

  useEffect(() => {
    return () => {
      if (previousValueRef.current) {
        onUploadingChange?.(false);
        previousValueRef.current = false;
      }
    };
  }, [onUploadingChange]);

  return useCallback(
    (uploading: boolean) => {
      if (previousValueRef.current === uploading) return;
      previousValueRef.current = uploading;
      onUploadingChange?.(uploading);
    },
    [onUploadingChange],
  );
}
