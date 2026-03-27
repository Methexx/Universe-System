import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const generateToken = (payload: object, expiresIn: string = env.JWT_EXPIRES_IN): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, env.JWT_SECRET);
};