import express from 'express';
import { getRecommendations, getTrending } from '../controllers/recommendation.controller.js';

const router = express.Router();

router.get('/', getRecommendations);
router.get('/trending', getTrending);

export default router;