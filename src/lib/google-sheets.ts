import { google } from "googleapis";

export type InquiryRow = {
  name: string;
  whatsapp: string;
  email: string;
  message?: string;
  preferredLanguage?: string;
};

export type RegistrationRow = {
  parentName: string;
  whatsapp: string;
  email: string;
  childName: string;
  childAge: string;
  level: string;
  city: string;
  country: string;
  message?: string;
  preferredLanguage?: string;
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
    range: process.env.GOOGLE_SHEET_RANGE || "Inquiries!A:F",
    registrationRange:
      process.env.GOOGLE_REGISTER_SHEET_RANGE || "Registrations!A:J",
  };
}

export function isGoogleSheetsConfigured(): boolean {
  return getGoogleSheetsConfig() !== null;
}

async function getAuthAndSheets() {
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
  return { config, sheets };
}

export async function appendInquiryToGoogleSheet({
  name,
  whatsapp,
  email,
  message,
  preferredLanguage,
}: InquiryRow): Promise<void> {
  const { config, sheets } = await getAuthAndSheets();

  await sheets.spreadsheets.values.append({
    spreadsheetId: config.spreadsheetId,
    range: config.range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[new Date().toISOString(), name, whatsapp, email, message || "", preferredLanguage || ""]],
    },
  });
}

export async function appendRegistrationToGoogleSheet({
  parentName,
  whatsapp,
  email,
  childName,
  childAge,
  level,
  city,
  country,
  message,
  preferredLanguage,
}: RegistrationRow): Promise<void> {
  const { config, sheets } = await getAuthAndSheets();

  await sheets.spreadsheets.values.append({
    spreadsheetId: config.spreadsheetId,
    range: config.registrationRange,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          new Date().toISOString(),
          parentName,
          whatsapp,
          email,
          childName,
          childAge,
          level,
          city,
          country,
          message || "",
          preferredLanguage || "",
        ],
      ],
    },
  });
}
