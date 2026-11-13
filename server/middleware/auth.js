import './../config/env.js';
import jwt from 'jsonwebtoken';
import { getDb } from '../database.js';
import { adminAuth, adminDb, isInitialized } from '../config/firebaseAdmin.js';

const PLACEHOLDER_JWT_SECRETS = new Set([
  'your_jwt_secret_here',
  'replace_with_a_long_random_jwt_secret',
  'changeme',
  'secret',
  'petal_and_thread_secure_jwt_atelier_secret_2026'
]);

const LEGACY_EXAMPLE_JWT_SECRET = 'petal_and_thread_atelier_secret_jwt_key_2026';

/**
 * Resolves and validates JWT_SECRET from the environment without any hardcoded fallback.
 */
export function getJwtSecret() {
  const secret = typeof process.env.JWT_SECRET === 'string' ? process.env.JWT_SECRET.trim() : '';
  const isProd = process.env.NODE_ENV === 'production';

  if (
    !secret ||
    secret.length < 16 ||
    PLACEHOLDER_JWT_SECRETS.has(secret) ||
    (isProd && secret === LEGACY_EXAMPLE_JWT_SECRET)
  ) {
    throw new Error(
      'JWT_SECRET environment variable is missing, shorter than 16 characters, or uses an insecure placeholder value.'
    );
  }

  return secret;
}

/**
 * Inspects JWT_SECRET startup readiness for fail-fast production checks and non-production diagnostics.
 */
export function validateJwtConfiguration() {
  const secret = typeof process.env.JWT_SECRET === 'string' ? process.env.JWT_SECRET.trim() : '';
  try {
    getJwtSecret();
    return {
      valid: true,
      usingLegacyExampleSecret: secret === LEGACY_EXAMPLE_JWT_SECRET
    };
  } catch (err) {
    return {
      valid: false,
      error: err.message,
      usingLegacyExampleSecret: false
    };
  }
}

function verifyLegacyAdminToken(token) {
  let secret;
  try {
    secret = getJwtSecret();
  } catch (cfgErr) {
    return {
      status: 503,
      error: 'Legacy administrator JWT authentication is unavailable: JWT_SECRET is not configured securely.'
    };
  }

  try {
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    const db = getDb();
    const admin = db.admins?.find(a => a.id === decoded.id && a.role === 'admin');

    if (!admin) {
      return {
        status: 403,
        error: 'Access forbidden. Authorized administrator credentials required.'
      };
    }

    return {
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role
      },
      user: {
        uid: admin.id,
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: 'admin',
        admin: true,
        authType: 'legacy'
      }
    };
  } catch (legacyErr) {
    return {
      status: 401,
      error: legacyErr.name === 'TokenExpiredError'
        ? 'Session expired. Please sign in again.'
        : 'Invalid or forged administrator token.'
    };
  }
}

/**
 * Classifies an incoming Bearer token using unverified structural header/payload inspection.
 * IMPORTANT: This classification is used SOLELY to select the appropriate cryptographic validator,
 * NEVER to grant authorization or trust claims.
 *
 * Returns: 'firebase' | 'legacy' | 'unknown'
 */
export function classifyTokenType(token) {
  try {
    const unverified = jwt.decode(token, { complete: true });
    if (!unverified || !unverified.header || !unverified.payload) {
      return 'unknown';
    }

    const { header, payload } = unverified;

    // Firebase ID Tokens are asymmetric RS256 issued by Google Secure Token Service
    if (
      header.alg === 'RS256' &&
      typeof payload.iss === 'string' &&
      payload.iss.startsWith('https://securetoken.google.com/')
    ) {
      return 'firebase';
    }

    // Legacy Atelier Tokens are symmetric HS256 issued by the local server for admins
    if (
      header.alg === 'HS256' &&
      payload.role === 'admin' &&
      Boolean(payload.id)
    ) {
      return 'legacy';
    }

    return 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Middleware: Requires any authenticated user (Customer, Seller, or Admin).
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. Authentication token required.' });
  }

  const token = authHeader.split(' ')[1];
  const tokenType = classifyTokenType(token);

  if (tokenType === 'firebase') {
    if (!isInitialized || !adminAuth) {
      return res.status(503).json({ error: 'Firebase Authentication service is currently unavailable.' });
    }

    try {
      const decoded = await adminAuth.verifyIdToken(token);
      req.user = {
        uid: decoded.uid,
        id: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.email?.split('@')[0] || 'User',
        role: decoded.admin === true ? 'admin' : (decoded.seller === true ? 'seller' : 'customer'),
        admin: Boolean(decoded.admin),
        seller: Boolean(decoded.seller),
        authType: 'firebase'
      };
      return next();
    } catch (fbErr) {
      return res.status(401).json({
        error: fbErr.name === 'TokenExpiredError'
          ? 'Session expired. Please sign in again.'
          : 'Invalid or revoked Firebase authentication credentials.'
      });
    }
  }

  if (tokenType === 'legacy') {
    const result = verifyLegacyAdminToken(token);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    req.admin = result.admin;
    req.user = result.user;
    return next();
  }

  return res.status(401).json({ error: 'Access denied. Invalid or unrecognized authentication token format.' });
}

/**
 * Middleware: Requires Administrator privileges.
 * Routes tokens deterministically to their authoritative validator.
 * Invalid Firebase tokens immediately fail with 401 (never fall back to legacy HMAC).
 */
export async function requireAdmin(req, res, next) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. Administrator token required.' });
  }

  const token = authHeader.split(' ')[1];
  const tokenType = classifyTokenType(token);

  // 1. Firebase ID Token Verification Path
  if (tokenType === 'firebase') {
    if (!isInitialized || !adminAuth) {
      return res.status(503).json({
        error: 'Firebase Authentication service is currently unavailable.'
      });
    }

    try {
      const decoded = await adminAuth.verifyIdToken(token);

      // Verify administrator custom claim
      if (decoded.admin !== true) {
        return res.status(403).json({
          error: 'Access forbidden. Administrator privileges required.'
        });
      }

      req.user = {
        uid: decoded.uid,
        id: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.email?.split('@')[0] || 'Administrator',
        role: 'admin',
        admin: true,
        authType: 'firebase'
      };

      req.admin = {
        id: decoded.uid,
        username: decoded.email?.split('@')[0] || 'admin',
        email: decoded.email,
        name: decoded.name || 'Administrator',
        role: 'admin'
      };

      return next();
    } catch (fbErr) {
      // Strictly fail closed with 401 on Firebase verification error - DO NOT fall back to legacy
      return res.status(401).json({
        error: fbErr.name === 'TokenExpiredError'
          ? 'Firebase session expired. Please sign in again.'
          : 'Invalid or revoked Firebase authentication credentials.'
      });
    }
  }

  // 2. Legacy Admin HMAC Token Verification Path
  if (tokenType === 'legacy') {
    const result = verifyLegacyAdminToken(token);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    req.admin = result.admin;
    req.user = result.user;
    return next();
  }

  // 3. Unrecognized or Malformed Token Format
  return res.status(401).json({
    error: 'Access denied. Invalid or unrecognized authentication token format.'
  });
}

/**
 * Middleware: Requires Active Seller or Administrator privileges.
 * Permits:
 *  - Administrators (Firebase claim admin === true or legacy JWT admin)
 *  - Active Sellers (Firebase claim seller === true AND verified active status in Firestore)
 * Rejects unprivileged customers, inactive sellers, or missing services (fails closed).
 */
export async function requireSellerOrAdmin(req, res, next) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. Authentication token required.' });
  }

  const token = authHeader.split(' ')[1];
  const tokenType = classifyTokenType(token);

  // 1. Firebase Token Verification Path
  if (tokenType === 'firebase') {
    if (!isInitialized || !adminAuth) {
      return res.status(503).json({
        error: 'Firebase Authentication service is currently unavailable.'
      });
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(token);
    } catch (fbErr) {
      // Fail closed immediately on Firebase verification failure
      return res.status(401).json({
        error: fbErr.name === 'TokenExpiredError'
          ? 'Firebase session expired. Please sign in again.'
          : 'Invalid or revoked Firebase authentication credentials.'
      });
    }

    // Case A: Administrator via Firebase claim
    if (decoded.admin === true) {
      req.user = {
        uid: decoded.uid,
        id: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.email?.split('@')[0] || 'Administrator',
        role: 'admin',
        admin: true,
        authType: 'firebase'
      };

      req.admin = {
        id: decoded.uid,
        username: decoded.email?.split('@')[0] || 'admin',
        email: decoded.email,
        name: decoded.name || 'Administrator',
        role: 'admin'
      };

      return next();
    }

    // Case B: Seller Verification
    // Check Firestore first if available, or local sellers store fallback
    if (isInitialized && adminDb) {
      try {
        const sellerDoc = await adminDb.collection('seller_profiles').doc(decoded.uid).get();
        if (!sellerDoc.exists) {
          return res.status(403).json({
            error: 'Access forbidden. Seller profile does not exist.'
          });
        }

        const profile = sellerDoc.data();
        if (profile.status !== 'active') {
          return res.status(403).json({
            error: `Access forbidden. Seller account status is '${profile.status || 'inactive'}'. Only active sellers are permitted.`
          });
        }

        req.user = {
          uid: decoded.uid,
          id: decoded.uid,
          sellerId: decoded.uid,
          email: decoded.email,
          name: profile.storeName || decoded.name || decoded.email?.split('@')[0] || 'Seller',
          role: 'seller',
          seller: true,
          authType: 'firebase'
        };

        return next();
      } catch (dbErr) {
        console.error('Error verifying seller profile in Firestore:', dbErr);
        return res.status(503).json({
          error: 'Failed to verify seller authorization status with database service.'
        });
      }
    } else {
      // Offline / Local development fallback: check local store.json sellers or claim
      const db = getDb();
      const localSeller = db.sellers?.find(s => s.id === decoded.uid || s.email === decoded.email);
      if (localSeller) {
        if (localSeller.status !== 'active') {
          return res.status(403).json({
            error: `Access forbidden. Seller account status is '${localSeller.status}'. Only active sellers are permitted.`
          });
        }

        req.user = {
          uid: decoded.uid,
          id: decoded.uid,
          sellerId: decoded.uid,
          email: decoded.email,
          name: localSeller.storeName || 'Seller',
          role: 'seller',
          seller: true,
          authType: 'firebase'
        };
        return next();
      }

      if (decoded.seller === true) {
        req.user = {
          uid: decoded.uid,
          id: decoded.uid,
          sellerId: decoded.uid,
          email: decoded.email,
          name: decoded.name || 'Seller',
          role: 'seller',
          seller: true,
          authType: 'firebase'
        };
        return next();
      }

      return res.status(503).json({
        error: 'Seller database service is temporarily unavailable. Seller actions cannot be authorized.'
      });
    }
  }

  // 2. Legacy Admin HMAC Token Verification Path
  if (tokenType === 'legacy') {
    const result = verifyLegacyAdminToken(token);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    req.admin = result.admin;
    req.user = result.user;
    return next();
  }

  // 3. Unrecognized or Malformed Token Format
  return res.status(401).json({
    error: 'Access denied. Invalid or unrecognized authentication token format.'
  });
}
