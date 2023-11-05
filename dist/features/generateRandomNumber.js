"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function generateRandomNumber(min = 100000000000000, max = 999999999999999) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}
exports.default = generateRandomNumber;
