"use server";

import { loginService } from "@/services/admin-services";
import { cookies } from "next/headers";
import { createS3Client } from "@/config/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, ObjectCannedACL, PutObjectCommand } from "@aws-sdk/client-s3";
import { getImageClientS3URL } from "@/config/axios";

export const loginAction = async (payload: any) => {
  try {
    const res: any = await loginService(payload);
       console.log("LOGIN RESPONSE:", res?.data);
    const user = res?.data?.data;
    console.log('user: ', user);
    return res.data;
  } catch (error: any) {
       console.error("LOGIN ERROR:", error?.response?.data || error);
    return error?.response?.data;
  }
};

export const logoutAction = async () => {
  return { success: true };
};

export const getTokenCustom = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value || "";
};

export const generateSignedUrlToUploadOn = async (fileName: string, fileType: string) => {
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `products/${fileName}`,
    ContentType: fileType,
    acl: "public-read",
  };
  try {
    const command = new PutObjectCommand(uploadParams);
    console.log('command: ', command);
    const signedUrl = await getSignedUrl(await createS3Client(), command);
    // const signedUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
    return { signedUrl, key: uploadParams.Key };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
};

export const generateSignedUrlForProfile = async (fileName: string, fileType: string) => {
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `profiles/${fileName}`,
    ContentType: fileType,
    acl: "public-read",
  };
  try {
    const command = new PutObjectCommand(uploadParams);
    const signedUrl = await getSignedUrl(await createS3Client(), command);
    return { signedUrl, key: uploadParams.Key };
  } catch (error) {
    console.error("Error generating signed URL for profile:", error);
    throw error;
  }
};


export const deleteFileFromS3 = async (imageKey: string) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: imageKey,
  };
  try {
    const s3Client = await createS3Client();
    const command = new DeleteObjectCommand(params);
    const response = await s3Client.send(command);
    return response;
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw error;
  }
};

export const getFileWithMetadata = async (fileKey: string) => {
  if (!fileKey) {
    throw new Error("fileKey is required");
  }
  try {
    const s3 = await createS3Client();

    const headData = await s3.send(
      new HeadObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fileKey,
      })
    );
    const metadata = headData.Metadata || {};
    if (metadata.timestamps) {
      try {
        const firstDecode = Buffer.from(metadata.timestamps, "base64").toString("utf-8");
        const secondDecode = Buffer.from(firstDecode, "base64").toString("utf-8");
        metadata.timestamps = JSON.parse(secondDecode);
      } catch (error) {
        console.error("Error decoding metadata timestamps:", error);
      }
    }
    const fileUrl = await getImageClientS3URL(fileKey);
    return {
      fileUrl,
      metadata,
    };
  } catch (error) {
    console.error("❌ Error fetching file metadata:", error);

    if (error.name === "NotFound") {
      throw new Error("❌ File not found in S3. Check the fileKey and bucket.");
    }

    throw new Error("❌ Error fetching file and metadata");
  }
};
