import express from 'express';
import {
  getCards,
  getCard,
  createCard,
  updateCard,
  deleteCard
} from '../controllers/cardController.js';

const router = express.Router();

router.get('/', getCards);
router.get('/:id', getCard);
router.post('/', createCard);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);

export default router;
