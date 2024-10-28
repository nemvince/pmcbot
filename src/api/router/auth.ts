import express from 'express';
import { authCallback } from '@/api/controllers/auth';

const router = express.Router();

export default (): express.Router => {
  router.get('/callback', authCallback);

  return router;
}