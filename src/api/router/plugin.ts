import express from 'express';
import { startAuthorization } from '@/api/controllers/plugin';

const router = express.Router();

export default (): express.Router => {
  router.post('/auth', startAuthorization);

  return router;
}