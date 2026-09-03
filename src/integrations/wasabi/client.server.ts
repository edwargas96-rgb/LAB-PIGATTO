// Server-side Wasabi (S3-compatible) client.
// SECURITY: Only use this for trusted server-side operations, never expose to client code.
// Load inside server handlers, same as supabaseAdmin.
import { S3Client } from "@aws-sdk/client-s3";

function createWasabiClient() {
  const accessKeyId = process.env["WASABI_ACCESS_KEY"];
  const secretAccessKey = process.env["WASABI_SECRET_KEY"];
  const region = process.env["WASABI_REGION"];
  const endpoint = process.env["WASABI_ENDPOINT"];

  const missing = [
    ...(!accessKeyId ? ["WASABI_ACCESS_KEY"] : []),
    ...(!secretAccessKey ? ["WASABI_SECRET_KEY"] : []),
    ...(!region ? ["WASABI_REGION"] : []),
    ...(!endpoint ? ["WASABI_ENDPOINT"] : []),
  ];
  if (missing.length > 0) {
    throw new Error(`Variável(is) de ambiente do Wasabi ausente(s): ${missing.join(", ")}`);
  }

  return new S3Client({
    region: region!,
    endpoint: `https://${endpoint}`,
    forcePathStyle: true,
    credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
  });
}

let _wasabiClient: S3Client | undefined;

export function getWasabiClient() {
  if (!_wasabiClient) _wasabiClient = createWasabiClient();
  return _wasabiClient;
}

export function getWasabiBucket() {
  const bucket = process.env["WASABI_BUCKET"];
  if (!bucket) throw new Error("Variável de ambiente WASABI_BUCKET ausente.");
  return bucket;
}
