import * as dotenv from "dotenv";
dotenv.config();
export const orgConfig = {
  orgCredentials: {
    secretKey: process.env.NILLION_ORG_SECRET,
    orgDid: process.env.NILLION_ORG_DID,
  },
  nodes: [
    {
      url: process.env.NILLION_NODE1_URL,
      did: process.env.NILLION_NODE1_DID,
    },
    {
      url: process.env.NILLION_NODE2_URL,
      did: process.env.NILLION_NODE2_DID,
    },
    {
      url: process.env.NILLION_NODE3_URL,
      did: process.env.NILLION_NODE3_DID,
    },
  ],
};
