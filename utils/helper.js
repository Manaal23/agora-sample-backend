"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const genToken = (user) => {
    const token = (0, jsonwebtoken_1.sign)({ id: user.id }, process.env.TOKEN_SECRET, {
        expiresIn: user.validity,
    });
    return token;
};
exports.genToken = genToken;
