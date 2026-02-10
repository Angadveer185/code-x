import jwt from "jsonwebtoken";
import type { JwtPayload } from "./type";
/**
 * take the useremail and id and hash them to generate the accesstoken with 1 day expiry
 * again hash the useremail and id to generate a refersh token with 20 day expiry
 */
export function generateFreshTokens(payload: JwtPayload) {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return { accessToken, refreshToken };
}
/**
 * incase when the access token gets expired, then generate a new accesstoken but before that check
 * for the refreshToken verification
 */
export function generateAccessToken(payload: JwtPayload) {
  //TODO: verify pre-existing refreshToken

  const options = {
    expiresIn: "1d", // Token expiration time
  };
  //@ts-ignore
  const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, options);
  return token;
}
/**
 * incase when the refresh token gets expired, then generate a new refreshtoken
 */
export function generateRefreshToken(payload: JwtPayload) {
  const options = {
    expiresIn: "20d", // Token expiration time
  };
  //@ts-ignore
  const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, options);
  return token;
}
/**
 * decode the accessToken here.
 */
export function verifyAccessToken(accessToken: string) {
  try {
    return jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET as string,
    ) as JwtPayload;
  } catch (error) {
    throw new Error("invalid or expired access token");
  }
}
export function verifyRefreshToken(refreshToken: string) {
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string,
    ) as JwtPayload;

    return decoded;
  } catch (error) {
    throw new Error("invalid or expired refresh token");
  }
}
