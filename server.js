"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const agoraRoutes_1 = __importDefault(require("./routes/agoraRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use((0, cors_1.default)());
app.use(agoraRoutes_1.default);
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log("server is running at port", PORT);
});
