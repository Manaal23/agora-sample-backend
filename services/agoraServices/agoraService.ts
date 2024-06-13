import axios from "axios"
import { Request, Response } from "express";
import { genToken } from "../../utils/helper";
import { verify } from "jsonwebtoken";

let interval: string | number | NodeJS.Timeout | undefined;
const startRecording = async (resourceId: string, channelName:string, token:string, uid:string) => {
    const body= {
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
                    `${channelName}${uid}`,
                ]
            }
        }
    }
    console.log(JSON.stringify(body), `https://api.agora.io/v1/apps/${process.env.AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/mode/web/start`,"*************dddd")
    const result = await axios.post(`https://api.agora.io/v1/apps/${process.env.AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/mode/web/start`, body,{
        headers: {
            "Authorization": token,
            "Content-Type": 'application/json;charset=utf-8'
        }
    })
    console.log(result,"**************start")
    interval = setInterval(() => {
        queryRecording(resourceId, result.data.sid)
    },10000)
    return result.data
}

const queryRecording = async (resourceId:string,sid:string) => {
    try{

        const plainCredential = process.env.AGORA_CUSTOMER_KEY + ":" + process.env.AGORA_CUSTOMER_SECRET;
    
        const encodedCredential = Buffer.from(plainCredential).toString('base64')
    
        const result = await axios.get(`https://api.agora.io/v1/apps/${process.env.AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/web/query`, {
            headers: {
                "Authorization": "Basic " + encodedCredential,
                "Content-Type": 'application/json'
            }
        })
    
        console.log(JSON.stringify(result.data),"*****************query")
    }catch(err){
        clearInterval(interval)
        console.log(err, "query failedddd")
    }
}

class agoraService{

    async record(req: Request, res: Response) {
        try{
            const {uid} = req.params;
            const plainCredential = process.env.AGORA_CUSTOMER_KEY + ":" + process.env.AGORA_CUSTOMER_SECRET;

            const encodedCredential = Buffer.from(plainCredential).toString('base64')
    
            const result = await axios.post(`https://api.agora.io/v1/apps/${process.env.AGORA_APP_ID}/cloud_recording/acquire`, {
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
            })
        
            console.log(result.data,"*************acquire")

            let startRecResponse=result.data;
            if (result.data.resourceId)
            startRecResponse = await startRecording(result.data.resourceId, "newchannel","Basic " + encodedCredential,uid)
    
            return res.status(201).send({
                success: true,
                data: startRecResponse
            })
        }catch(e){
            return res.status(500).send({
                success: false,
                data: e
            })
        }
    }
    async stopRecord (req: Request, res: Response) {
        try{

            const {resourceid,uid,sid} = req.params;
            
            console.log(req.params,"**************params")
            const plainCredential = process.env.AGORA_CUSTOMER_KEY + ":" + process.env.AGORA_CUSTOMER_SECRET;
    
            const encodedCredential = Buffer.from(plainCredential).toString('base64')
    
            const result = await axios.post(`http://api.agora.io/v1/apps/${process.env.AGORA_APP_ID}/cloud_recording/resourceid/${resourceid}/sid/${sid}/mode/web/stop`, {
                "cname": "newchannel",
                "uid": uid,
                "clientRequest": {}
            }, {
                headers: {
                    "Authorization": "Basic " + encodedCredential,
                    "Content-Type": 'application/json;charset=utf-8'
                }
            })
            console.log(JSON.stringify(result.data.serverResponse), "**********************Stop")
            clearInterval(interval)

            return res.status(201).send({
                success: true,
                data: "Recording stopped!"
            })
        }catch(e){
            console.log(e,"****************Stop failed")
            return res.status(500).send({
                success: false,
                data: e
            })
        }
    }

    async agoraRecorder(req: Request, res: Response){
        console.log(req.headers,"***************889898")
        console.log(req,"*****************mmmmmmmm")
        let token = genToken({ id: "token123", validity: "10m" });
        res.redirect(`${process.env.FRONTEND_URL}/live-streaming?${token}`)
    }

    async verifyRecorder(req: Request, res: Response){

        const token = req.headers.authorization as string;
        const plainCredential = process.env.AGORA_CUSTOMER_KEY + ":" + process.env.AGORA_CUSTOMER_SECRET;
        const encodedCredential = Buffer.from(plainCredential).toString('base64')

        verify(token, process.env.TOKEN_SECRET as string, (err, decoded) => {
            if (err) {
              return res.status(400).send({
                success: false,
                data: "Verification failed!"
              })
            } else {
              const decodedToken = decoded as { id: string };
              if (decodedToken.id === encodedCredential)
                return res.status(201).send({
                    success: true,
                    data: "Verification successfull!"
                  })
                  else
                  return res.status(400).send({
                    success: false,
                    data: "Verification failed!"
                  })
            }
          });

    }
}

export default new agoraService();