import express from "express";
import agoraService from "../services/agoraServices/agoraService";

const app = express.Router()

app.post("/record/:uid", agoraService.record)
app.post("/stop-record/:uid/:resourceid/:sid", agoraService.stopRecord)
app.get("/agora_recorder", agoraService.agoraRecorder)
app.post("/verify/rec-auth", agoraService.verifyRecorder)

export default app;