import type { Route } from "./+types/home";
import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../../components/auth/auth-provider";
import { endpoints } from "../../services/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Authenticating…" },
    { name: "description", content: "Preparing POS session" },
  ];
}

export default function Home() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { token: storedToken, setAuth, clearAuth } = useAuth();

  const qp = useMemo(() => {
    const token = params.get("token") || params.get("access_token") || "";
    const sessionId = params.get("session_id") || params.get("sid") || "";
    return { token, sessionId };
  }, [params]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        // If token provided in query, store it (and optional session id)
        if (qp.token) {
          setAuth({ token: qp.token, sessionId: qp.sessionId || undefined });
        }

        const tokenToTest = qp.token || storedToken || "";

        if (!tokenToTest) {
          // No token available to validate -> 404
          navigate("/404", { replace: true });
          return;
        }

        // Validate by calling a lightweight endpoint; interceptor will attach token/session_id
        await endpoints.system.healthCheck();

        // Settings are now fetched in AuthProvider right after authentication

        if (!cancelled) {
          navigate("/pos", { replace: true });
        }
      } catch (e) {
        if (!cancelled) {
            console.log(qp.token)
          // Clear invalid auth and go to 404

          // clearAuth();
          // navigate("/404", { replace: true });
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [clearAuth, navigate, qp.sessionId, qp.token, setAuth, storedToken]);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-2">Checking your session…</h1>
      <p className="text-gray-700">Please wait while we prepare your POS workspace.</p>
    </div>
  );
}
