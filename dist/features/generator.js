"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompareHash = exports.HashPassword = exports.GenerateRandom = void 0;
const bcrypt_1 = require("bcrypt");
const otp_generator_1 = require("otp-generator");
function GenerateRandom(length) {
    return (0, otp_generator_1.generate)(length, {
        lowerCaseAlphabets: false,
        digits: false,
        upperCaseAlphabets: true,
        specialChars: false,
    });
}
exports.GenerateRandom = GenerateRandom;
function HashPassword(password) {
    const salt = (0, bcrypt_1.genSaltSync)(16);
    const hash = (0, bcrypt_1.hashSync)(password, salt);
    return hash;
}
exports.HashPassword = HashPassword;
function CompareHash(password, hashed) {
    const salt = (0, bcrypt_1.genSaltSync)(16);
    const matched = (0, bcrypt_1.compareSync)(password, hashed);
    return matched;
}
exports.CompareHash = CompareHash;
