import express from 'express';
import { authCallback } from '@/api/controllers/oauth';

const router = express.Router();

export default (): express.Router => {
  router.get('/callback', authCallback);

  return router;
}