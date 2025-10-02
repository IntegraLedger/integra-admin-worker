import { Env } from '../types';
import { hashPassword, generateJWT } from '../utils/crypto';
import { jsonResponse, errorResponse } from '../utils/response';

export async function handleLogin(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as { password: string };

    if (!body.password) {
      return errorResponse('MISSING_PASSWORD', 'Password is required', 400);
    }

    // Compare with plaintext password (simple auth for Phase 1)
    if (body.password !== env.ADMIN_PASSWORD_PLAINTEXT) {
      return errorResponse('INVALID_PASSWORD', 'Invalid password', 401);
    }

    // Generate JWT token
    const jwtSecret = env.JWT_SECRET || 'default-secret-change-me';
    const expiresAt = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours

    const payload = {
      iss: 'integra-admin-worker',
      exp: expiresAt,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = await generateJWT(payload, jwtSecret);

    // Store token in KV with 24-hour expiration
    await env.ADMIN_SESSIONS.put(token, JSON.stringify({
      createdAt: new Date().toISOString(),
      expiresAt: new Date(expiresAt * 1000).toISOString(),
    }), {
      expirationTtl: 24 * 60 * 60
    });

    return jsonResponse({
      token,
      expiresAt: new Date(expiresAt * 1000).toISOString(),
    });
  } catch (error) {
    return errorResponse('LOGIN_ERROR', 'Login failed', 500);
  }
}

export async function handleVerify(request: Request, env: Env): Promise<Response> {
  // If we reach here, authMiddleware has already validated the token
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.substring(7) || '';

  try {
    const jwtSecret = env.JWT_SECRET || 'default-secret-change-me';
    const { exp } = await import('../utils/crypto').then(m => m.verifyJWT(token, jwtSecret));

    return jsonResponse({
      valid: true,
      expiresAt: new Date(exp * 1000).toISOString(),
    });
  } catch (error) {
    return errorResponse('INVALID_TOKEN', 'Token verification failed', 401);
  }
}
