import { Env } from '../types';
import { verifyJWT } from '../utils/crypto';
import { errorResponse } from '../utils/response';

export async function authMiddleware(
  request: Request,
  env: Env
): Promise<Response | null> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse('UNAUTHORIZED', 'Missing or invalid authorization header', 401);
  }

  const token = authHeader.substring(7);

  try {
    // Verify JWT
    const jwtSecret = env.JWT_SECRET || 'default-secret-change-me';
    const payload = await verifyJWT(token, jwtSecret);

    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return errorResponse('TOKEN_EXPIRED', 'Token has expired', 401);
    }

    // Check if token exists in KV
    const storedToken = await env.ADMIN_SESSIONS.get(token);
    if (!storedToken) {
      return errorResponse('INVALID_TOKEN', 'Token not found or revoked', 401);
    }

    // Token is valid
    return null;
  } catch (error) {
    return errorResponse('INVALID_TOKEN', 'Invalid token', 401);
  }
}
