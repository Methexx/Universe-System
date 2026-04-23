import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';

export const generateToken = (payload: object, expiresIn: string = "7d"): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: expiresIn as SignOptions['expiresIn'] });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, env.JWT_SECRET);
};