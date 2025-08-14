import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../../../components/auth/auth-provider';

export default function InjectAuthRoute() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const { token, sessionId, redirect } = useMemo(() => {
    const t = params.get('token') || params.get('access_token') || '';
    const sid = params.get('session_id') || params.get('sid') || '';
    const red = params.get('redirect') || '/';
    return { token: t, sessionId: sid, redirect: red };
  }, [params]);

  useEffect(() => {
    // If there's a token, store and redirect
    if (token) {
      setAuth({ token, sessionId: sessionId || undefined });
      // Small delay to ensure storage writes before navigation
      const id = setTimeout(() => {
        navigate(redirect, { replace: true });
      }, 50);
      return () => clearTimeout(id);
    }
  }, [navigate, redirect, setAuth, sessionId, token]);

  if (!token) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <h1 className="text-xl font-semibold mb-2">Authentication token missing</h1>
        <p className="text-gray-700">No token was provided in the URL. Please ensure the Laravel app opens this route with a token query parameter, e.g.:</p>
        <code className="block mt-2 break-all text-sm bg-gray-100 p-2 rounded">
          /auth/inject?token=YOUR_TOKEN&amp;session_id=1&amp;redirect=/pos
        </code>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-2">Signing you in…</h1>
      <p className="text-gray-700">Applying secure session and redirecting…</p>
    </div>
  );
}
