"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/app/lib/api";
import { readEventList } from "./eventDisplay";

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
    const request = api.get("/public/events", LIST_PARAMS).then((res) => {
      const data = readEventList(res);
      return { items: data.items, totalItems: data.total_items ?? data.items.length };
    });
    listPromise = request;
    const clear = () => { if (listPromise === request) listPromise = null; };
    request.then(clear, clear);
  }
  return listPromise;
}

function loadCities(force = false) {
  if (!citiesPromise || force) {
    const request = api.get("/public/events/cities").then((res) => {
      if (!Array.isArray(res?.data?.cities)) throw new Error("Respons daftar kota tidak valid.");
      return [...new Set(res.data.cities.filter((city) => typeof city === "string" && city))];
    });
    citiesPromise = request;
    const clear = () => { if (citiesPromise === request) citiesPromise = null; };
    request.then(clear, clear);
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
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    loadCities(reloadKey > 0)
      .then((list) => {
        if (!ignore) { setCities(list); setError(null); setLoading(false); }
      })
      .catch((err) => {
        if (!ignore) { setError(err?.message || "Gagal memuat daftar kota."); setLoading(false); }
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  }, []);

  return { cities, loading, error, retry };
}
