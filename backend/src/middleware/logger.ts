import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, path, ip } = req;
  const userAgent = req.get('User-Agent') || 'unknown';

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    logger.info('HTTP_REQUEST', `${method} ${path}`, {
      method,
      path,
      statusCode,
      durationMs: duration,
      ip,
      userAgent
    });
  });

  next();
};