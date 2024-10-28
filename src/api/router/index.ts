import express from 'express';
import auth from './auth';

const router = express.Router();

export default (): express.Router => {
  router.get('/health', (req, res) => {
    res.send({
      status: 'OK',
    });
  });

  router.use('/auth', auth());

  return router;
}