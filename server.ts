import express from "express";
import agoraRecording from "./routes/agoraRoutes";
import dotenv from "dotenv";
import cors from "cors";

const app = express();
dotenv.config();
app.use(cors())

app.use(agoraRecording)

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log("server is running at port", PORT)
})