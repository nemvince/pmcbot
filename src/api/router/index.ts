import express from 'express';
import auth from './oauth';
import plugin from './plugin';

const router = express.Router();

export default (): express.Router => {
  router.get('/', (req, res) => {
    res.send({
      status: 'OK',
      message: 'API server is running'
    });
  });

  router.use('/auth', auth());
  router.use('/plugin', plugin());

  return router;
}