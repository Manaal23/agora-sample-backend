"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const agoraService_1 = __importDefault(require("../services/agoraServices/agoraService"));
const app = express_1.default.Router();
app.post("/record/:uid", agoraService_1.default.record);
app.post("/stop-record/:uid/:resourceid/:sid", agoraService_1.default.stopRecord);
app.get("/agora-recorder", agoraService_1.default.agoraRecorder);
app.post("/verify/rec-auth", agoraService_1.default.verifyRecorder);
exports.default = app;
