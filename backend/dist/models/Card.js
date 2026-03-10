"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = exports.CardStatus = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
var CardStatus;
(function (CardStatus) {
    CardStatus["TODO"] = "TODO";
    CardStatus["IN_PROGRESS"] = "IN_PROGRESS";
    CardStatus["DONE"] = "DONE";
    CardStatus["REJECTED"] = "REJECTED";
})(CardStatus || (exports.CardStatus = CardStatus = {}));
const cardSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: Object.values(CardStatus),
        default: CardStatus.TODO,
    },
    assignee: {
        type: String,
        trim: true,
    },
    assigneeName: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
exports.Card = mongoose_1.default.model("Card", cardSchema);
