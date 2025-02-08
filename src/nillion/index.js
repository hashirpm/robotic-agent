import express from "express";
import { SecretVaultWrapper } from "nillion-sv-wrappers";
import { orgConfig } from "./nillionOrgConfig.js";
import cors from "cors";
// CORS configuration
const corsOptions = {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"], // Add your frontend URLs
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply CORS middleware

const app = express();
app.use(cors(corsOptions));
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
    const { service, apiKey } = req.body;
    const collection = initCollection(
      req.orgCredentials,
      process.env.API_KEYS_SCHEMA_ID
    );

    await collection.init();
    const data = [{ service, apiKey: { $allot: apiKey } }];
    const result = await collection.writeToNodes(data);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/getApiKeyOfAService", extractOrgCredentials, async (req, res) => {
  console.log("GET /api-keys");
  let { service } = req.body;
  try {
    const collection = initCollection(
      req.orgCredentials,
      process.env.API_KEYS_SCHEMA_ID
    );
    await collection.init();

    const decryptedData = await collection.readFromNodes({ service: service });
    const serializedData = JSON.parse(
      JSON.stringify(decryptedData, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );
    console.log(serializedData[0]);
    res.json({ success: true, data: serializedData[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/getAiConfig", extractOrgCredentials, async (req, res) => {
  console.log("GET config");
  let { name } = req.body;
  try {
    const collection = initCollection(
      req.orgCredentials,
      process.env.AI_CONFIG_SCHEMA_ID
    );
    await collection.init();

    const decryptedData = await collection.readFromNodes({
      name: name,
    });
    const serializedData = JSON.parse(
      JSON.stringify(decryptedData, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );
    console.log(serializedData[0]);
    res.json({ success: true, data: serializedData[0] });
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
      process.env.ROBOT_DATA_SCHEMA_ID
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
      process.env.ROBOT_DATA_SCHEMA_ID
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
      process.env.ROBOT_LOG_SCHEMA_ID
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
      process.env.ROBOT_LOG_SCHEMA_ID
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
      process.env.AI_CONFIG_SCHEMA_ID
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
      process.env.AI_CONFIG_SCHEMA_ID
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
      process.env.ROBOT_LOG_SCHEMA_ID
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
      process.env.ROBOT_LOG_SCHEMA_ID
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

app.post("/robotLog", async (req, res) => {
  try {
    let {
      raceId,
      robot1Id,
      robot2Id,
      robot1Energy,
      robot2Energy,
      robot1Position,
      robot2Position,
      robot1Speed,
      robot2Speed,
    } = req.body;

    // Update robot 1 stats
    if (robot1Energy > 0) {
      robot1Speed = Math.max(
        0,
        Math.min(100, robot1Speed + (Math.random() - 0.5) * 10)
      );
      robot1Energy = Math.max(0, Math.min(100, robot1Energy - 1));
      robot1Position = Math.max(
        0,
        Math.min(100, robot1Position + (robot1Speed / 100) * 0.5)
      );
    }

    // Update robot 2 stats
    if (robot2Energy > 0) {
      robot2Speed = Math.max(
        0,
        Math.min(100, robot2Speed + (Math.random() - 0.5) * 10)
      );
      robot2Energy = Math.max(0, Math.min(100, robot2Energy - 1));
      robot2Position = Math.max(
        0,
        Math.min(100, robot2Position + (robot2Speed / 100) * 0.5)
      );
    }

    res.json({
      success: true,
      data: {
        raceId,
        robot1: {
          id: robot1Id,
          speed: robot1Speed,
          energy: robot1Energy,
          position: robot1Position,
        },
        robot2: {
          id: robot2Id,
          speed: robot2Speed,
          energy: robot2Energy,
          position: robot2Position,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/robotInitialLog", async (req, res) => {
  try {
    let { raceId, robot1Id, robot2Id } = req.body;
    res.json({
      success: true,
      data: {
        raceId,
        robot1: {
          id: robot1Id,
          speed: 75,
          energy: 100,
          position: 0,
        },
        robot2: {
          id: robot2Id,
          speed: 82,
          energy: 100,
          position: 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/raceLog", extractOrgCredentials, async (req, res) => {
  try {
    let {
      raceId,
      robot1Id,
      robot2Id,
      robot1Energy,
      robot2Energy,
      robot1Position,
      robot2Position,
      robot1Speed,
      robot2Speed,
    } = req.body;
    const collection = initCollection(
      req.orgCredentials,
      process.env.RACE_LOG_SCHEMA_ID
    );
    const publicData = { robot1Id, robot2Id };
    const sensitiveData = {
      robot1Energy,
      robot2Energy,
      robot1Position,
      robot2Position,
      robot1Speed,
      robot2Speed,
    };
    await collection.init();

    const data = [
      {
        raceId,
        timestamp: new Date().toISOString(),
        publicData,
        sensitiveData: { $allot: JSON.stringify(sensitiveData) },
      },
    ];
    console.log(data);
    const result = await collection.writeToNodes(data);
    console.log(result);
    res.json({
      success: true,
      data: {
        raceId,
        robot1: {
          id: robot1Id,
          speed: robot1Speed,
          energy: robot1Energy,
          position: robot1Position,
        },
        robot2: {
          id: robot2Id,
          speed: robot2Speed,
          energy: robot2Energy,
          position: robot2Position,
        },
      },
    });
    // res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/getLatestRaceLog", extractOrgCredentials, async (req, res) => {
  try {
    let { raceId } = req.body;
    const collection = initCollection(
      req.orgCredentials,
      process.env.RACE_LOG_SCHEMA_ID
    );
    await collection.init();
    const decryptedData = await collection.readFromNodes({ raceId: raceId });
    const serializedData = JSON.parse(
      JSON.stringify(decryptedData, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );
    console.log(serializedData);
    res.json({
      success: true,
      data: serializedData[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/getDataOfARobot", extractOrgCredentials, async (req, res) => {
  try {
    let { robotId } = req.body;

    const collection = initCollection(
      req.orgCredentials,
      process.env.ROBOT_DATA_SCHEMA_ID
    );
    await collection.init();

    const decryptedData = await collection.readFromNodes({ robotId: robotId });
    const serializedData = JSON.parse(
      JSON.stringify(decryptedData, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    res.json({ success: true, data: serializedData[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
