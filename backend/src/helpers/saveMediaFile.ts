import { FileContents, FileStorage } from "@flystorage/file-storage";
import { LocalStorageAdapter } from "@flystorage/local-fs";
import { AwsS3StorageAdapter } from "@flystorage/aws-s3";
import { S3Client } from "@aws-sdk/client-s3";
import mime from "mime-types";
import { getPublicPath } from "./GetPublicPath";
import { logger } from "../utils/logger";
import { makeRandomId } from "./MakeRandomId";
import Ticket from "../models/Ticket";

function getStorage(): FileStorage {
  const storageType = process.env.STORAGE_TYPE || "local";

  if (storageType === "s3") {
    if (
      !process.env.S3_BUCKET ||
      !process.env.AWS_REGION ||
      !process.env.AWS_ACCESS_KEY_ID ||
      !process.env.AWS_SECRET_ACCESS_KEY
    ) {
      throw new Error(
        "S3 storage is enabled, but S3 environment variables are not fully configured."
      );
    }

    const client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    const adapter = new AwsS3StorageAdapter(client, { bucket: process.env.S3_BUCKET });
    return new FileStorage(adapter);
  }

  // Default to local storage
  const adapter = new LocalStorageAdapter(getPublicPath());
  return new FileStorage(adapter);
}

export default async function saveMediaToFile(
  media: {
    data: FileContents;
    mimetype: string;
    filename: string;
  },
  destination: Ticket | number
): Promise<string> {
  if (!media || !media.data || !media.mimetype || !destination) {
    logger.error("saveMediaToFile: Invalid media or destination provided");
    throw new Error("Invalid media or destination provided");
  }

  if (!media.filename) {
    const rawMimetype = media.mimetype.split(";")[0];
    const ext = mime.extension(rawMimetype) || "bin";
    media.filename = `${new Date().getTime()}.${ext}`;
  }

  const randomId = makeRandomId(10);

  const companyId =
    typeof destination === "number" ? destination : destination.companyId;
  const contactId =
    typeof destination === "number" ? undefined : destination.contactId;
  const ticketId = typeof destination === "number" ? undefined : destination.id;

  let relativePath = `media/${companyId}/`;

  if (contactId && ticketId) {
    relativePath += `${contactId}/${ticketId}/`;
  }

  relativePath += `${randomId}`;

  const storage = getStorage();

  const mediaPath = `${relativePath}/${media.filename.replace(/ /g, "_")}`;

  try {
    await storage.write(mediaPath, media.data);
  } catch (error) {
    logger.error({ message: error.message }, "Error saving media file");
    throw new Error("Failed to save media file");
  }

  if (storage.adapter instanceof AwsS3StorageAdapter) {
    return storage.publicUrl(mediaPath);
  }

  return mediaPath;
}
