import { generateSignedUrlToUploadOn } from "@/actions";

// Uploads a chat photo to S3 and returns its key (sent as the message's mediaUrl)
export const uploadChatImage = async (file: File) => {
  const { signedUrl, key } = await generateSignedUrlToUploadOn(
    `chat-${Date.now()}-${file.name.replace(/\s+/g, "-")}`,
    file.type,
  );
  const upload = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!upload.ok) throw new Error("upload failed");
  return key;
};
