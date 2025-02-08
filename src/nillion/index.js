import express from "express";
import { SecretVaultWrapper } from "nillion-sv-wrappers";
import { orgConfig } from "./nillionOrgConfig.js";

const app = express();
app.use(express.json());

// Function to initialize a new collection with provided credentials
const initCollection = (orgCredentials, collectionId) => {
  return new SecretVaultWrapper(orgConfig.nodes, orgCredentials, collectionId);
};

const extractOrgCredentials = (req, res, next) => {
  const secretKey = req.headers["secretkey"] || req.headers["x-org-secret"];
  const orgDid = req.headers["orgdid"] || req.headers["x-org-did"];

  if (!secretKey || !orgDid) {
    return res
      .status(401)
      .json({ success: false, error: "Missing credentials" });
  }

  req.orgCredentials = { secretKey, orgDid };
  next();
};

// API Keys Endpoints
app.post("/api-keys", extractOrgCredentials, async (req, res) => {
  try {
    const { service, apiKey, apiSecret } = req.body;
    const collection = initCollection(
      req.orgCredentials,
      "bc4cd53a-07a8-4bba-8805-d8b55f65c7a8"
    );

    await collection.init();
    const data = [
      { service, apiKey: { $allot: apiKey }, apiSecret: { $allot: apiSecret } },
    ];
    const result = await collection.writeToNodes(data);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api-keys", extractOrgCredentials, async (req, res) => {
  console.log("GET /api-keys");

  try {
    const collection = initCollection(
      req.orgCredentials,
      "bc4cd53a-07a8-4bba-8805-d8b55f65c7a8"
    );
    await collection.init();

    const decryptedData = await collection.readFromNodes({});
    const serializedData = JSON.parse(
      JSON.stringify(decryptedData, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );
    console.log(serializedData);
    res.json({ success: true, data: serializedData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Robot Data Endpoints
app.post("/robots", extractOrgCredentials, async (req, res) => {
  try {
    const {
      robotId,
      name,
      level,
      baseSpeed,
      minStakeAmount,
      wallet,
      twitterHandle,
      tokenName,
      tokenAddress,
      hiddenAbilities,
    } = req.body;
    const collection = initCollection(
      req.orgCredentials,
      "3ac5ca11-3b7a-45f7-aef4-fc4ef80cc594"
    );

    await collection.init();
    const data = [
      {
        robotId,
        name,
        level,
        baseSpeed: { $allot: baseSpeed },
        minStakeAmount,
        wallet: { $allot: wallet },
        twitterHandle,
        tokenName,
        tokenAddress,
        hiddenAbilities: { $allot: JSON.stringify(hiddenAbilities) },
      },
    ];
    const result = await collection.writeToNodes(data);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/robots", extractOrgCredentials, async (req, res) => {
  try {
    const collection = initCollection(
      req.orgCredentials,
      "3ac5ca11-3b7a-45f7-aef4-fc4ef80cc594"
    );
    await collection.init();

    const decryptedData = await collection.readFromNodes({});
    const serializedData = JSON.parse(
      JSON.stringify(decryptedData, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    res.json({ success: true, data: serializedData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Robot Logs Endpoints
app.post("/robot-logs", extractOrgCredentials, async (req, res) => {
  try {
    const { robotId, actionType, publicData, sensitiveData } = req.body;
    const collection = initCollection(
      req.orgCredentials,
      "e1f0f1a9-a2fd-454e-9384-d3b572f522a4"
    );

    await collection.init();
    const data = [
      {
        robotId,
        timestamp: new Date().toISOString(),
        actionType,
        publicData,
        sensitiveData: { $allot: JSON.stringify(sensitiveData) },
      },
    ];
    const result = await collection.writeToNodes(data);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/robot-logs", extractOrgCredentials, async (req, res) => {
  try {
    const collection = initCollection(
      req.orgCredentials,
      "e1f0f1a9-a2fd-454e-9384-d3b572f522a4"
    );
    await collection.init();

    const decryptedData = await collection.readFromNodes({});
    const serializedData = JSON.parse(
      JSON.stringify(decryptedData, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    res.json({ success: true, data: serializedData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Configuration Endpoints
app.post("/ai-config", extractOrgCredentials, async (req, res) => {
  try {
    const { configType, name, data } = req.body;
    const collection = initCollection(
      req.orgCredentials,
      "24a01fa2-9c0b-4950-a4a7-b1b47d17bd1f"
    );

    await collection.init();
    const configData = [
      { configType, name, data: { $allot: JSON.stringify(data) } },
    ];
    const result = await collection.writeToNodes(configData);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/ai-config", extractOrgCredentials, async (req, res) => {
  try {
    const collection = initCollection(
      req.orgCredentials,
      "24a01fa2-9c0b-4950-a4a7-b1b47d17bd1f"
    );
    await collection.init();

    const decryptedData = await collection.readFromNodes({});
    const serializedData = JSON.parse(
      JSON.stringify(decryptedData, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    res.json({ success: true, data: serializedData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Robot Vault Server running on port ${PORT}`)
);

app.post("/addRobotStake", extractOrgCredentials, async (req, res) => {
  try {
    const { staker_id, staker_amount, race_id, robot_id } = req.body;
    const collection = initCollection(
      req.orgCredentials,
      "e1f0f1a9-a2fd-454e-9384-d3b572f522a4"
    );
    const actionType = "STAKE";
    const publicData = { staker_id, staker_amount, race_id };
    const sensitiveData = {};
    await collection.init();
    const data = [
      {
        robot_id,
        timestamp: new Date().toISOString(),
        actionType,
        publicData,
        sensitiveData: { $allot: JSON.stringify(sensitiveData) },
      },
    ];
    const result = await collection.writeToNodes(data);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/addRobotTrap", extractOrgCredentials, async (req, res) => {
  try {
    const { buyer_id, trap_amount, race_id, robot_id } = req.body;
    const collection = initCollection(
      req.orgCredentials,
      "e1f0f1a9-a2fd-454e-9384-d3b572f522a4"
    );
    const actionType = "TRAP";
    const publicData = { buyer_id, trap_amount, race_id };
    const sensitiveData = {};
    await collection.init();
    const data = [
      {
        robot_id,
        timestamp: new Date().toISOString(),
        actionType,
        publicData,
        sensitiveData: { $allot: JSON.stringify(sensitiveData) },
      },
    ];
    const result = await collection.writeToNodes(data);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});