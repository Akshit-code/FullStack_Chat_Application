import dotenv from 'dotenv';
dotenv.config();

interface config {
    port:number
    aws_access_key_id: string;
    aws_secret_access_key:string;
    bucket_name:string
    region: string;
}

export const AWS_Instance:config  = {
    port: parseInt(process.env.PORT || "3000"),
    aws_access_key_id: process.env.AWS_ACCESS_KEY_ID || "",
    aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY || "",
    bucket_name: process.env.BUCKET_NAME || "",
    region: process.env.AWS_REGION || ""
}