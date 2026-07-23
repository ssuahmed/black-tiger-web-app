"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "@/lib/api/auth";
import { setSessionExpiredHandler } from "@/lib/api/client";
import {
  BT_ACCESS_TOKEN_KEY,
  BT_REFRESH_TOKEN_KEY,
  BT_USER_KEY,
  clearAuthSession,
  readStoredUser,
  writeAuthSession,
} from "@/lib/authStorage";

const AuthContext = createContext(null);

export { BT_ACCESS_TOKEN_KEY, BT_REFRESH_TOKEN_KEY, BT_USER_KEY } from "@/lib/authStorage";

/** Single-flight refresh so React Strict Mode remounts share one rotation. */
let refreshInflight = null;

function refreshOnce(refreshToken) {
  if (!refreshInflight) {
    refreshInflight = authApi
      .refreshTokens({ refreshToken })
      .finally(() => {
        refreshInflight = null;
      });
  }
  return refreshInflight;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;

    async function bootstrap() {
      const refreshToken =
        typeof window !== "undefined"
          ? window.localStorage.getItem(BT_REFRESH_TOKEN_KEY)
          : null;

      if (refreshToken) {
        try {
          const data = await refreshOnce(refreshToken);
          if (!alive) return;
          if (data?.accessToken && data?.refreshToken && data.user != null) {
            writeAuthSession(data);
            setUser(data.user);
          } else {
            clearAuthSession();
            setUser(null);
          }
        } catch {
          if (!alive) return;
          const stored = readStoredUser();
          const access =
            typeof window !== "undefined"
              ? window.localStorage.getItem(BT_ACCESS_TOKEN_KEY)
              : null;
          if (stored && access) {
            setUser(stored);
          } else {
            clearAuthSession();
            setUser(null);
          }
        }
      } else {
        const stored = readStoredUser();
        const access =
          typeof window !== "undefined"
            ? window.localStorage.getItem(BT_ACCESS_TOKEN_KEY)
            : null;
        if (stored && access) {
          setUser(stored);
        } else {
          clearAuthSession();
          setUser(null);
        }
      }

      if (alive) setReady(true);
    }

    bootstrap();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  const persistAuthResponse = useCallback((data) => {
    if (data?.accessToken && data?.refreshToken && data.user != null) {
      writeAuthSession(data);
      setUser(data.user);
    }
  }, []);

  const loginWithPassword = useCallback(
    async (body) => {
      const data = await authApi.loginWithPassword(body);
      persistAuthResponse(data);
      return data;
    },
    [persistAuthResponse],
  );

  const registerWithPassword = useCallback(
    async (body) => {
      const data = await authApi.registerWithPassword(body);
      persistAuthResponse(data);
      return data;
    },
    [persistAuthResponse],
  );

  const verifyOtp = useCallback(
    async (body) => {
      const data = await authApi.verifyOtp(body);
      if (data?.resetSessionToken) {
        return data;
      }
      if (data?.accessToken) {
        persistAuthResponse(data);
      }
      return data;
    },
    [persistAuthResponse],
  );

  const refreshSession = useCallback(async () => {
    const refreshToken =
      typeof window !== "undefined"
        ? window.localStorage.getItem(BT_REFRESH_TOKEN_KEY)
        : null;
    if (!refreshToken) return null;
    const data = await authApi.refreshTokens({ refreshToken });
    persistAuthResponse(data);
    return data;
  }, [persistAuthResponse]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* stale session */
    }
    clearAuthSession();
    setUser(null);
  }, []);

  const applyAuthPayload = useCallback(
    (data) => {
      persistAuthResponse(data);
    },
    [persistAuthResponse],
  );

  const submitIdentifier = useCallback(async (body) => authApi.submitIdentifier(body), []);

  const sendOtp = useCallback(async (body) => authApi.sendOtp(body), []);

  const resendOtp = useCallback(async (body) => authApi.resendOtp(body), []);

  const value = useMemo(
    () => ({
      user,
      ready,
      isAuthenticated: Boolean(user?.id),
      submitIdentifier,
      sendOtp,
      resendOtp,
      loginWithPassword,
      registerWithPassword,
      verifyOtp,
      refreshSession,
      logout,
      applyAuthPayload,
    }),
    [
      user,
      ready,
      submitIdentifier,
      sendOtp,
      resendOtp,
      loginWithPassword,
      registerWithPassword,
      verifyOtp,
      refreshSession,
      logout,
      applyAuthPayload,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
