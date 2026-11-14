import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  getFavoriteArtists,
  getFavoriteEvents,
  toggleFavoriteArtist as toggleArtistStorage,
  toggleFavoriteEvent as toggleEventStorage,
} from '../utils/storage';

interface FavoritesContextType {
  favoriteArtists: string[];
  favoriteEventIds: number[];
  isArtistFavorite: (name: string) => boolean;
  isEventFavorite: (id: number) => boolean;
  toggleArtist: (name: string) => Promise<void>;
  toggleEvent: (id: number) => Promise<void>;
  reloadFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteArtists, setFavoriteArtists] = useState<string[]>([]);
  const [favoriteEventIds, setFavoriteEventIds] = useState<number[]>([]);

  const reloadFavorites = useCallback(async () => {
    const [artists, events] = await Promise.all([getFavoriteArtists(), getFavoriteEvents()]);
    setFavoriteArtists(artists);
    setFavoriteEventIds(events);
  }, []);

  useEffect(() => {
    reloadFavorites();
  }, [reloadFavorites]);

  const isArtistFavorite = useCallback(
    (name: string) => favoriteArtists.includes(name),
    [favoriteArtists]
  );

  const isEventFavorite = useCallback(
    (id: number) => favoriteEventIds.includes(id),
    [favoriteEventIds]
  );

  const toggleArtist = useCallback(async (name: string) => {
    const updated = await toggleArtistStorage(name);
    setFavoriteArtists(updated);
  }, []);

  const toggleEvent = useCallback(async (id: number) => {
    const updated = await toggleEventStorage(id);
    setFavoriteEventIds(updated);
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteArtists,
        favoriteEventIds,
        isArtistFavorite,
        isEventFavorite,
        toggleArtist,
        toggleEvent,
        reloadFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
