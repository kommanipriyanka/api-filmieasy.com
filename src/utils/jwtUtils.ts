import type { Context } from "hono";

import { sign, verify } from "hono/jwt";
import { JwtTokenExpired, JwtTokenInvalid, JwtTokenSignatureMismatched } from "hono/utils/jwt/types";

import type { User } from "../database/schemas/users";
import type { JWTUserPayload } from "../types/appTypes";

import { jwtConfig } from "../config/jwtConfig";
import { TOKEN_EXPIRED, TOKEN_INVALID, TOKEN_MISSING, TOKEN_SIG_MISMATCH, USER_NOT_FOUND } from "../constants/appMessages";
import { users } from "../database/schemas/users";
import UnAuthorizedException from "../exceptions/unauthorizedException";
import { getSingleRecordByMultipleColumnValues } from "../services/baseDbServices";

export type UserPayload = User;

async function genJWTTokens(payload: JWTUserPayload) {
  const now = Math.floor(Date.now() / 1000);
  const access_token_expiry = now + jwtConfig.expires_in;
  const refresh_token_expiry = now + (jwtConfig.expires_in * 3);

  const access_token = await sign({ ...payload, exp: access_token_expiry }, jwtConfig.secret);
  const refresh_token = await sign({ ...payload, exp: refresh_token_expiry }, jwtConfig.secret);

  return { access_token, refresh_token };
}

async function genJWTTokensForUser(userId: number) {
  // Create Payload
  const payload: JWTUserPayload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
  };

  // Generate Tokens
  return await genJWTTokens(payload);
}

async function verifyJWTToken(token: string) {
  try {
    const decodedPayload = await verify(token, jwtConfig.secret);

    return decodedPayload;
  }
  catch (error: any) {
    if (error instanceof JwtTokenInvalid) {
      throw new UnAuthorizedException(TOKEN_INVALID);
    }

    if (error instanceof JwtTokenExpired) {
      throw new UnAuthorizedException(TOKEN_EXPIRED);
    }

    if (error instanceof JwtTokenSignatureMismatched) {
      throw new UnAuthorizedException(TOKEN_SIG_MISMATCH);
    }

    throw error;
  }
}

async function getUserDetailsFromToken(c: Context) {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.substring(7, authHeader.length);

  if (!token) {
    throw new UnAuthorizedException(TOKEN_MISSING);
  }
  const decodedPayload = await verifyJWTToken(token);

  // Check if the user is existing in the system - in case the user is removed from the system the jwt token can still be valid
  const user = await getSingleRecordByMultipleColumnValues(users, ["id"], ["="], [decodedPayload.sub]);
  if (!user) {
    throw new UnAuthorizedException(USER_NOT_FOUND);
  }

  return user;
}

export { genJWTTokens, genJWTTokensForUser, getUserDetailsFromToken, verifyJWTToken };
