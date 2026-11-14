"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/app/lib/api";

/**
 * Fetch daftar event publik (GET /api/public/events) + daftar kota
 * (GET /api/public/events/cities) untuk Landing Page.
 *
 * Request yang sama dibagi (shared promise) antar section agar Hero,
 * FeaturedEvent, dan ArtistSection tidak memanggil endpoint berulang kali.
 */
const LIST_PARAMS = { page: 1, per_page: 12 };

let listPromise = null;
let citiesPromise = null;

function loadList(force = false) {
  if (!listPromise || force) {
    listPromise = api.get("/public/events", LIST_PARAMS).then((res) => ({
      items: res?.data?.items || [],
      totalItems: res?.data?.total_items ?? (res?.data?.items || []).length,
    }));
    listPromise.catch(() => {
      listPromise = null;
    });
  }
  return listPromise;
}

function loadCities(force = false) {
  if (!citiesPromise || force) {
    citiesPromise = api.get("/public/events/cities").then((res) => res?.data?.cities || []);
    citiesPromise.catch(() => {
      citiesPromise = null;
    });
  }
  return citiesPromise;
}

export function useLandingEvents() {
  const [state, setState] = useState({
    events: [],
    totalItems: 0,
    loading: true,
    error: null,
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    loadList(reloadKey > 0)
      .then(({ items, totalItems }) => {
        if (!ignore) setState({ events: items, totalItems, loading: false, error: null });
      })
      .catch((err) => {
        if (!ignore) {
          setState({
            events: [],
            totalItems: 0,
            loading: false,
            error: err?.message || "Tidak dapat terhubung ke server TicketWave.",
          });
        }
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const retry = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    setReloadKey((k) => k + 1);
  }, []);

  return { ...state, retry };
}

export function useLandingCities() {
  const [cities, setCities] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    loadCities()
      .then((list) => {
        if (!ignore) setCities(list);
      })
      .catch((err) => {
        if (!ignore) setError(err?.message || "Gagal memuat daftar kota.");
      });
    return () => {
      ignore = true;
    };
  }, []);

  return { cities, error };
}
