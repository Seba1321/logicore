import type { EmpresaLogin } from "@/lib/supabase";

const PORTAL_SESSION_KEY = "methodical.portal.session";

export const savePortalSession = (session: EmpresaLogin) => {
  localStorage.setItem(PORTAL_SESSION_KEY, JSON.stringify(session));
};

export const getPortalSession = () => {
  const rawSession = localStorage.getItem(PORTAL_SESSION_KEY);

  if (!rawSession) return null;

  try {
    const session = JSON.parse(rawSession) as EmpresaLogin;

    if (!session.session_token || new Date(session.expires_at).getTime() <= Date.now()) {
      localStorage.removeItem(PORTAL_SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    localStorage.removeItem(PORTAL_SESSION_KEY);
    return null;
  }
};

export const clearPortalSession = () => {
  localStorage.removeItem(PORTAL_SESSION_KEY);
};
