require("dotenv/config");
const { getprofile } = require("./utils/getProfile");
const { getRegistrationState } = require("./utils/registrationState");
const { getCapeUrls } = require("./utils/getCapeUrls");
const { setcape } = require("./utils/setcape");
const { generateToken, validateToken } = require("./utils/tokenGen");
const { getUserFromToken } = require("./utils/getUserFromToken");
const { validateTokenBoolState } = require("./utils/tokenGen");
const ngrok = require("@ngrok/ngrok");
const { generateCapePreview } = require("./utils/capePreviews");
const fs = require("fs");
const {
  Client,
  Routes,
  REST,
  GatewayIntentBits,
  Collection,
  Events,
  Partials,
  ActivityType,
  PresenceUpdateStatus,
} = require("discord.js");

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;
const PUBLIC_URL = process.env.PUBLIC_URL + `:${process.env.PORT}` || `http://localhost:${PORT}`;
const SERVICE_PORT = process.env.SERVICE_PORT || PORT;

// JSON middleware
app.use(express.json());

// ngrok reverseproxy listenter

/*
(async () => {
  const listener = await ngrok.forward({
    addr: PORT,
    authtoken: process.env.NGROK_AUTHTOKEN,
  });

  console.log(listener.url());
})();
*/
// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  const query = Object.keys(req.query).length ? ` query=${JSON.stringify(req.query)}` : '';
  let body = '';
  if (req.method === 'POST' && req.body && Object.keys(req.body).length) {
    const sanitized = { ...req.body };
    if (sanitized.token) sanitized.token = '***';
    body = ` body=${JSON.stringify(sanitized)}`;
  }
  
  console.log(`[${timestamp}] --> ${req.method} ${req.originalUrl}${query}${body}`);
  
  const originalSend = res.send.bind(res);
  const originalJson = res.json.bind(res);
  const originalSendFile = res.sendFile.bind(res);
  
  res.send = function (data) {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] <-- ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    return originalSend(data);
  };
  
  res.json = function (data) {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] <-- ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    return originalJson(data);
  };
  
  res.sendFile = function (path, options, callback) {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] <-- ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    return originalSendFile(path, options, callback);
  };
  
  next();
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
  ]
});

client.commands = new Collection();

const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

const CAPES_DIR = path.join(__dirname, "assets", "capes");
const RENDERS_DIR = path.join(__dirname, "assets", "renders", "capes");

// Ensure folders exist
fs.mkdirSync(CAPES_DIR, { recursive: true });
fs.mkdirSync(RENDERS_DIR, { recursive: true });

// Multer memory storage
const upload = multer({
    storage: multer.memoryStorage()
});

// Rate limit store: 2 cape uploads per 24 hours for permission levels 1 and 2
// Format: { userId: [timestamp1, timestamp2, ...] }
const capeUploadStore = {};

function checkCapeUploadLimit(userId, permissionLvl) {
    if (permissionLvl > 2) {
        return { allowed: true };
    }

    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    if (!capeUploadStore[userId]) {
        capeUploadStore[userId] = [];
    }

    capeUploadStore[userId] = capeUploadStore[userId].filter(
        timestamp => now - timestamp < TWENTY_FOUR_HOURS
    );

    if (capeUploadStore[userId].length >= 2) {
        const oldestInWindow = capeUploadStore[userId][0];
        const retryAfter = Math.ceil((TWENTY_FOUR_HOURS - (now - oldestInWindow)) / 1000);
        return { allowed: false, retryAfter };
    }

    return { allowed: true };
}

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`smth is fucked up with ${filePath}`);
  }
}

const deployCommands = async () => {
  const commands = [];
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if ("data" in command) commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log(`Deploying ${commands.length} commands...`);
    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );
    console.log(`Deployed ${data.length} commands successfully`);
  } catch (error) {
    console.error(error);
  }
};

client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await deployCommands();
  console.log("Commands deployed");
  const statusType = PresenceUpdateStatus.Online;
  const activityType = ActivityType.Watching;
  const activityName = "Over the catalog of capes";


  client.user.setPresence({
    status: statusType,
    activities: [
      {
        name: activityName,
        type: activityType,
      },
    ],
  });



});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true });
    } else {
      await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
    }
  }

});


// Generate unique 4-digit ID
function generateCapeId() {

    let id;

    do {

        id = Math.floor(
            1000 + Math.random() * 9000
        ).toString();

    } while (
        fs.existsSync(
            path.join(CAPES_DIR, `${id}.png`)
        )
    );

    return id;
}

// routes

app.use(express.static("public"));

// catalog of capes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// css endpoint
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'styles.css'));
});

app.get('/uptime-state', (req, res) => {
    res.type("text/plain");
    res.send("ok");
});

app.get('/index.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.js'));
});

app.get("/profile/:username", async (req, res) => {
  const { username } = req.params;
  const result = await getprofile(username);
  sendJson(res, result);
});

function sendJson(res, payload) {
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      return res.send(payload);
    }
  }
  return res.json(payload);
}

app.use(
    "/assets/capes",
    express.static("assets/capes")
);

app.get("/registration-state/:username", async (req, res) => {
    const { username } = req.params;

    const registrationState = await getRegistrationState(username);

    res.type("text/plain");
    res.send(String(registrationState));
});
 
app.post("/other", async (req, res) => {
    try {
        const usernames = req.body;
        
        if (!Array.isArray(usernames)) {
            return res.status(400).send({ error: "Request body must be an array of usernames" });
        }

        const result = await getCapeUrls(usernames, PUBLIC_URL);
        sendJson(res, result);
    } catch (error) {
        console.error("Error in /other endpoint:", error);
        res.status(500).send({ error: "Internal server error" });
    }
});

// Change player cape with token authentication
app.post("/change-cape", async (req, res) => {
    try {
        const { token, capeId } = req.body;

        if (!token) {
            return res.status(400).send({ error: "token is required" });
        }

        if (!capeId) {
            return res.status(400).send({ error: "capeId is required" });
        }

        // Validate token and get userId
        const userId = validateToken(token);

        if (!userId) {
            return res.status(401).send({ error: "Invalid or expired token" });
        }

        // Get user data for permission check
        const userData = await getUserFromToken(token);

        if (!userData) {
            return res.status(404).send({ error: "User data not found" });
        }

        // Check cape player permissions
        const capeMetaPath = path.join(__dirname, "cape_meta", `${capeId}.json`);

        try {
            const capeMetaRaw = fs.readFileSync(capeMetaPath, "utf-8");
            const capeMeta = JSON.parse(capeMetaRaw);
            const playerPermission = capeMeta.playerpermission;

            if (Array.isArray(playerPermission) && !playerPermission.includes("*")) {
                if (!playerPermission.includes(userData.ign)) {
                    return res.status(403).send({
                        error: "You don't have permission to use this cape"
                    });
                }
            }
        } catch {
            // No metadata file — allow everyone
        }

        // Change the cape
        const result = await setcape(userId, capeId);

        res.send({ success: true, message: result });
    } catch (error) {
        console.error("Error changing cape:", error);
        res.status(500).send({ error: "Internal server error" });
    }
});

app.get("/cape-list", async (req, res) => {
    try {
      // list capes in assets/capes directory and send them as an array of cape names without .png extension
      const capesDir = path.join(__dirname, "assets", "capes");
      const files = await fs.promises.readdir(capesDir);
      const capes = files
        .filter(file => file.endsWith(".png"))
        .map(file => file.replace(".png", ""));
      res.send(capes);
    } catch (error) {
        console.error("Error fetching cape list:", error);
        res.status(500).send({ error: "Internal server error" });
    }
});
// get capes preview
app.get("/preview/capes/:id", (req, res) => {

    const capeId = req.params.id;
    const baseDir = path.join(__dirname, "assets", "renders", "capes");

    const webpPath = path.join(baseDir, `${capeId}.webp`);
    const pngPath = path.join(baseDir, `${capeId}.png`);

    if (fs.existsSync(webpPath)) {
        return res.sendFile(webpPath);
    }

    if (fs.existsSync(pngPath)) {
        return res.sendFile(pngPath);
    }

    res.status(404).send({ error: "Render not found" });
});

// get cape metadata
app.get("/cape/meta/:id", async (req, res) => {
    try {
        const capeId = req.params.id;
        const capeMetaPath = path.join(
            __dirname,
            "cape_meta",
            `${capeId}.json`
        );

        // Check if metadata file exists
        if (fs.existsSync(capeMetaPath)) {
            const metadata = JSON.parse(fs.readFileSync(capeMetaPath, 'utf-8'));
            res.send(metadata);
        } else {
            // Return custom default metadata for capes without metadata
            res.send({
                category: "Hex",
                playerpermission: ["*"],
                authorId: 1189872646163284041,
                authorName: "Hex Collection"
            });
        }
    } catch (error) {
        console.error("Error fetching cape metadata:", error);
        res.status(500).send({ error: "Internal server error" });
    }
});

app.get("/profile/meta/:token", async (req, res) => {
    const { token } = req.params;
    
    if (!token) {
        return res.status(400).send({ error: "Token is required" });
    } 

    const userData = await getUserFromToken(token);
    
    if (!userData) {
        return res.status(401).send({ error: "Invalid or expired token" });
    }

    res.send(userData);
});

/* FormData fields: capeTexture -> required */

app.post(
    "/upload-cape",
    upload.fields([
        { name: "capeTexture", maxCount: 1 }
    ]),

    async (req, res) => {

        try {
            
            const category = req.body.category;
            const playerpermission = req.body.playerpermission;
            const token = req.get('token'); 

            if (!Array.isArray(playerpermission)) {
                return res.status(400).send({
                    error: "Player permission must be an array"
                });
            }

            const tokenvalidation = validateTokenBoolState(token);

            if (tokenvalidation == false) {
                return res.status(401).send({
                    error: "Invalid or expired token"
                });
            }


            if (!category) {
                return res.status(400).send({
                    error: "Category is required"
                });
            }

            const capeTexture =
                req.files?.capeTexture?.[0];

            if (!capeTexture) {

                return res.status(400).send({
                    error: "capeTexture is required"
                });
            }

            const userData = await getUserFromToken(token);

            // Rate limit check for permission levels 1 and 2
            const limitCheck = checkCapeUploadLimit(userData.userId, userData.permissionLvl);
            if (!limitCheck.allowed) {
                return res.status(429).send({
                    error: "Upload limit reached. You can upload a maximum of 2 capes per 24 hours.",
                    retryAfter: limitCheck.retryAfter
                });
            }

            //category check

            if (category == "Community") {
                if (userData.permissionLvl < 1) {
                    return res.status(403).send({
                        error: "You don't have permission to upload in this category"
                    });
                }
            } else if (category == "Partner") {
                if (userData.permissionLvl < 2) {
                    return res.status(403).send({
                        error: "You don't have permission to upload in this category"
                    });
                }
            } else if (category == "Hex") {
                if (userData.permissionLvl < 3) {
                    return res.status(403).send({
                        error: "You don't have permission to upload in this category"
                    });
                }
            } else if (category == "Staff") {
                if (userData.permissionLvl < 3) {
                    return res.status(403).send({
                        error: "You don't have permission to upload in this category"
                    });
                }
            } else if (category == "Mojang") {
                if (userData.permissionLvl < 3) {
                    return res.status(403).send({
                        error: "You don't have permission to upload in this category"
                    });
                }
            } else {
                return res.status(400).send({
                    error: "Invalid category"
                });
            }

            // Custom cape ID
            let capeId;
            if (req.body.capeId) {
                if (userData.permissionLvl < 2) {
                    return res.status(403).send({
                        error: "You don't have permission to use custom cape IDs"
                    });
                }
                if (!/^[a-zA-Z0-9_-]+$/.test(req.body.capeId)) {
                    return res.status(400).send({
                        error: "Cape ID must contain only letters, numbers, hyphens, and underscores"
                    });
                }
                if (fs.existsSync(path.join(CAPES_DIR, `${req.body.capeId}.png`))) {
                    return res.status(409).send({
                        error: "A cape with this ID already exists"
                    });
                }
                capeId = req.body.capeId;
            } else {
                capeId = generateCapeId();
            }

            // Save cape texture
            const capePath = path.join(
                CAPES_DIR,
                `${capeId}.png`
            );

            fs.writeFileSync(
                capePath,
                capeTexture.buffer
            );

            // Generate cape preview via renderer API
            let previewPath = null;
            try {
                const previewBuffer = await generateCapePreview(capeTexture.buffer);
                const previewFilePath = path.join(RENDERS_DIR, `${capeId}.png`);
                fs.writeFileSync(previewFilePath, previewBuffer);
                previewPath = `/renders/capes/${capeId}.png`;
            } catch (previewError) {
                console.error(`Failed to generate preview for cape ${capeId}:`, previewError.message);
            }

            // cape meta saving

            const capeMetaPath = path.join(
                __dirname,
                "cape_meta",
                `${capeId}.json`
            );

            let authorName = userData.ign;
            if (req.body.authorName) {
                if (userData.permissionLvl < 3) {
                    return res.status(403).send({
                        error: "You don't have permission to set custom author names"
                    });
                }
                authorName = req.body.authorName;
            }

            const capeMeta = {
                category: category,
                playerpermission: playerpermission,
                authorId: userData.userId,
                authorName: authorName
            };

            fs.writeFileSync(capeMetaPath, JSON.stringify(capeMeta));

            // Record the upload for rate limiting
            if (userData.permissionLvl <= 2) {
                if (!capeUploadStore[userData.userId]) {
                    capeUploadStore[userData.userId] = [];
                }
                capeUploadStore[userData.userId].push(Date.now());
            }

            res.send({
                success: true,
                capeId,
                authorid : userData.userId,
                authorname : authorName,

                texture:
                    `/assets/capes/${capeId}.png`,

                preview: previewPath
            });

        } catch (error) {

            console.error(
                "Error uploading cape:",
                error
            );

            res.status(500).send({
                error: "Internal server error"
            });
        }
    }
);

app.get("/api/version", (req, res) => {

    res.send('1');

});



client.login(process.env.DISCORD_TOKEN);

app.listen(SERVICE_PORT, () => {
    console.log(`Hex server running on port ${SERVICE_PORT}`);
});