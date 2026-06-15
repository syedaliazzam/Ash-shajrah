import { google } from "googleapis";

export type InquiryRow = {
  name: string;
  whatsapp: string;
  email: string;
  message?: string;
};

function getGoogleSheetsConfig() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
    return null;
  }

  return {
    spreadsheetId,
    serviceAccountEmail,
    privateKey,
    range: process.env.GOOGLE_SHEET_RANGE || "Inquiries!A:E",
  };
}

export function isGoogleSheetsConfigured(): boolean {
  return getGoogleSheetsConfig() !== null;
}

export async function appendInquiryToGoogleSheet({
  name,
  whatsapp,
  email,
  message,
}: InquiryRow): Promise<void> {
  const config = getGoogleSheetsConfig();
  if (!config) {
    throw new Error("Google Sheets environment variables are not configured.");
  }

  const auth = new google.auth.JWT({
    email: config.serviceAccountEmail,
    key: config.privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: config.spreadsheetId,
    range: config.range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[new Date().toISOString(), name, whatsapp, email, message || ""]],
    },
  });
}
