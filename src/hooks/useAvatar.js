import { useState, useEffect, useCallback } from 'react';
import { fetchAvatarBlob } from '../helpers/avatar';
import api from '../config/api';

export function useAvatar(userId, isSeller, hasAvatar) {
  const [avatarBlobUrl, setAvatarBlobUrl] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!hasAvatar || !userId) return;

    let cancelled = false;
    const url = isSeller
      ? `${api.defaults.baseURL}/sellers/${userId}/avatar`
      : `${api.defaults.baseURL}/customers/${userId}/avatar`;

    fetchAvatarBlob(url)
      .then((blobUrl) => {
        if (!cancelled) setAvatarBlobUrl(blobUrl);
      })
      .catch(() => {
        if (!cancelled) setAvatarBlobUrl(null);
      });

    return () => { cancelled = true; };
  }, [userId, isSeller, hasAvatar, refreshKey]);

  useEffect(() => {
    return () => {
      if (avatarBlobUrl) URL.revokeObjectURL(avatarBlobUrl);
    };
  }, [avatarBlobUrl]);

  const loading = hasAvatar && !avatarBlobUrl && userId;

  return { avatarBlobUrl, loading, refresh };
}
