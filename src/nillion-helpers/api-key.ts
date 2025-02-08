export async function getAPIKey(service: string) {
  const response = await fetch(
    `${process.env.NILLION_API_BASE_URL}/getApiKeyOfAService`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        secretKey: process.env.NILLION_ORG_SECRET,
        orgDid: process.env.NILLION_ORG_DID,
      },
      body: JSON.stringify({
        service,
      }),
    }
  );

  const responseData = await response.json();
  return responseData.data.apiKey;
}
