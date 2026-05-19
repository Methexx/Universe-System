import { FastifyInstance } from 'fastify';
import { authenticate } from '../../common/middleware/authenticate';
import {
  postItem,
  getItems,
  markCollected,
  deleteItem,
  postReport,
  getMyReports,
  markRecovered,
  getAllReports,
  getCommunityBoard,
  postComment
} from './lost-found.controller';

async function lostFoundRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate);

  // Found Items routes
  app.post('/items', postItem);
  app.get('/items', getItems);
  app.put('/items/:id/collected', markCollected);
  app.delete('/items/:id', deleteItem);

  // Lost Reports routes
  app.post('/reports', postReport);
  app.get('/reports/my', getMyReports);
  app.put('/reports/:id/recovered', markRecovered);
  app.get('/reports', getAllReports);
  app.get('/board', getCommunityBoard);
  app.post('/comments', postComment);
}

export default lostFoundRoutes;
