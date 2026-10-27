import { writeFile } from "node:fs/promises";

export async function getToken(
  authority: string,
  audience: string,
  clientId: string,
  clientSecret: string,
  scope: string,
): Promise<string> {
  const tokenResponse = await fetch(`${authority}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      audience: audience,
      grant_type: "client_credentials",
      scope: scope,
    }),
  });

  if (tokenResponse.status !== 200) {
    throw new Error(`Error while getting token: ${tokenResponse.status}`);
  }

  const responseBody = await tokenResponse.json();
  const accessToken = responseBody.access_token;

  return accessToken;
}

export async function issuePass(
  url: string,
  token: string,
  name: string,
  document: string,
): Promise<void> {
  const issuePassResponse = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      document: document,
    }),
  });

  if (issuePassResponse.status !== 201) {
    throw new Error(`Error while issuing pass: ${issuePassResponse.status}`);
  }

  const location = issuePassResponse.headers.get("Location");
  if (!location) {
    throw new Error("Error while reading location");
  }

  const passId = location.split("/").pop();

  const arrayBuffer = await issuePassResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await writeFile(`${passId}.png`, buffer);
}
