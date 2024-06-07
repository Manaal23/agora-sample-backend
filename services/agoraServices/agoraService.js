"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const helper_1 = require("../../utils/helper");
const jsonwebtoken_1 = require("jsonwebtoken");
let interval;
const startRecording = (resourceId, channelName, token, uid) => __awaiter(void 0, void 0, void 0, function* () {
    const body = {
        "cname": channelName,
        "uid": uid,
        "clientRequest": {
            "token": token,
            "extensionServiceConfig": {
                "errorHandlePolicy": "error_abort",
                "extensionServices": [
                    {
                        "serviceName": "web_recorder_service",
                        "errorHandlePolicy": "error_abort",
                        "serviceParam": {
                            "url": `${process.env.SERVER_URL}/agora-recorder`,
                            "audioProfile": 0,
                            "videoWidth": 1280,
                            "videoHeight": 720,
                            "maxRecordingHour": 3,
                        }
                    }
                ]
            },
            "recordingFileConfig": {
                "avFileType": [
                    "hls",
                    "mp4"
                ]
            },
            "storageConfig": {
                "vendor": 1,
                "region": 14,
                "bucket": process.env.AWS_S3_BUCKET_NAME,
                "accessKey": process.env.AWS_ACCESS_KEY_ID,
                "secretKey": process.env.AWS_SECRET_ACCESS_KEY,
                "fileNamePrefix": [
                    "Recording",
                    `${channelName}-${uid}`,
                ]
            }
        }
    };
    const result = yield axios_1.default.post(`https://api.agora.io/v1/apps/${process.env.AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/mode/web/start`, body, {
        headers: {
            "Authorization": token,
            "Content-Type": 'application/json;charset=utf-8'
        }
    });
    console.log(result, "**************start");
    interval = setInterval(() => {
        queryRecording(resourceId, result.data.sid);
    }, 10000);
    return result.data;
});
const queryRecording = (resourceId, sid) => __awaiter(void 0, void 0, void 0, function* () {
    const plainCredential = process.env.AGORA_CUSTOMER_KEY + ":" + process.env.AGORA_CUSTOMER_SECRET;
    const encodedCredential = Buffer.from(plainCredential).toString('base64');
    const result = yield axios_1.default.get(`https://api.agora.io/v1/apps/${process.env.AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/web/query`, {
        headers: {
            "Authorization": "Basic " + encodedCredential,
            "Content-Type": 'application/json'
        }
    });
    console.log(JSON.stringify(result.data), "*****************query");
});
class agoraService {
    record(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { uid } = req.params;
                const plainCredential = process.env.AGORA_CUSTOMER_KEY + ":" + process.env.AGORA_CUSTOMER_SECRET;
                const encodedCredential = Buffer.from(plainCredential).toString('base64');
                const result = yield axios_1.default.post(`https://api.agora.io/v1/apps/${process.env.AGORA_APP_ID}/cloud_recording/acquire`, {
                    "cname": "newchannel",
                    "uid": uid,
                    "clientRequest": {
                        "resourceExpiredHour": 24,
                        "scene": 1
                    }
                }, {
                    headers: {
                        "Authorization": "Basic " + encodedCredential,
                        "Content-Type": 'application/json;charset=utf-8'
                    }
                });
                console.log(result.data, "*************acquire");
                let startRecResponse = result.data;
                if (result.data.resourceId)
                    startRecResponse = yield startRecording(result.data.resourceId, "newchannel", "Basic " + encodedCredential, uid);
                return res.status(201).send({
                    success: true,
                    data: startRecResponse
                });
            }
            catch (e) {
                return res.status(500).send({
                    success: false,
                    data: e
                });
            }
        });
    }
    stopRecord(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { resourceid, uid, sid } = req.params;
                console.log(req.params, "**************params");
                const plainCredential = process.env.AGORA_CUSTOMER_KEY + ":" + process.env.AGORA_CUSTOMER_SECRET;
                const encodedCredential = Buffer.from(plainCredential).toString('base64');
                const result = yield axios_1.default.post(`http://api.agora.io/v1/apps/${process.env.AGORA_APP_ID}/cloud_recording/resourceid/${resourceid}/sid/${sid}/mode/web/stop`, {
                    "cname": "newchannel",
                    "uid": uid,
                    "clientRequest": {}
                }, {
                    headers: {
                        "Authorization": "Basic " + encodedCredential,
                        "Content-Type": 'application/json;charset=utf-8'
                    }
                });
                console.log(JSON.stringify(result.data.serverResponse), "**********************Stop");
                clearInterval(interval);
                return res.status(201).send({
                    success: true,
                    data: "Recording stopped!"
                });
            }
            catch (e) {
                return res.status(500).send({
                    success: false,
                    data: e
                });
            }
        });
    }
    agoraRecorder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(req.headers, "***************889898");
            let token = (0, helper_1.genToken)({ id: "token123", validity: "10m" });
            res.redirect(`${process.env.FRONTEND_URL}/live-streaming?${token}`);
        });
    }
    verifyRecorder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = req.headers.authorization;
            const plainCredential = process.env.AGORA_CUSTOMER_KEY + ":" + process.env.AGORA_CUSTOMER_SECRET;
            const encodedCredential = Buffer.from(plainCredential).toString('base64');
            (0, jsonwebtoken_1.verify)(token, process.env.TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(400).send({
                        success: false,
                        data: "Verification failed!"
                    });
                }
                else {
                    const decodedToken = decoded;
                    if (decodedToken.id === encodedCredential)
                        return res.status(201).send({
                            success: true,
                            data: "Verification successfull!"
                        });
                    else
                        return res.status(400).send({
                            success: false,
                            data: "Verification failed!"
                        });
                }
            });
        });
    }
}
exports.default = new agoraService();
