"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCard = exports.updateCard = exports.createCard = exports.getCards = void 0;
const Card_1 = require("../models/Card");
const getCards = async (req, res) => {
    try {
        const cards = await Card_1.Card.find();
        res.status(200).json(cards);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get cards' });
    }
};
exports.getCards = getCards;
const createCard = async (req, res) => {
    try {
        const { title, content, status, assignee, assigneeName } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        const card = new Card_1.Card({
            title,
            content,
            status: status || Card_1.CardStatus.TODO,
            assignee,
            assigneeName
        });
        const savedCard = await card.save();
        res.status(201).json(savedCard);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create card' });
    }
};
exports.createCard = createCard;
const updateCard = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, status, assignee, assigneeName } = req.body;
        console.log('Updating card with id:', id);
        console.log('Update data:', { title, content, status, assignee, assigneeName });
        const card = await Card_1.Card.findByIdAndUpdate(id, { title, content, status, assignee, assigneeName }, { returnDocument: 'after', runValidators: true });
        console.log('Updated card:', card);
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.status(200).json(card);
    }
    catch (error) {
        console.error('Error updating card:', error);
        res.status(500).json({ error: 'Failed to update card' });
    }
};
exports.updateCard = updateCard;
const deleteCard = async (req, res) => {
    try {
        const { id } = req.params;
        const card = await Card_1.Card.findByIdAndDelete(id);
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.status(200).json({ message: 'Card deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete card' });
    }
};
exports.deleteCard = deleteCard;
