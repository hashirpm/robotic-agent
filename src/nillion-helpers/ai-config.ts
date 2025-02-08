export async function getPrompt(promptName: string) {
  const response = await fetch(
    `${process.env.NILLION_API_BASE_URL}/getAiConfig`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        secretKey: process.env.NILLION_ORG_SECRET,
        orgDid: process.env.NILLION_ORG_DID,
      },
      body: JSON.stringify({
        name: promptName,
      }),
    }
  );

  const responseData = await response.json();
  return responseData.data.data.prompt;
}
export async function getWeight(weightName: string) {
  const response = await fetch(
    `${process.env.NILLION_API_BASE_URL}/getAiConfig`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        secretKey: process.env.NILLION_ORG_SECRET,
        orgDid: process.env.NILLION_ORG_DID,
      },
      body: JSON.stringify({
        name: weightName,
      }),
    }
  );

  const responseData = await response.json();
  return responseData.data.data.weight;
}
