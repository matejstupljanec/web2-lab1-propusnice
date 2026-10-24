import "dotenv/config";
import express from "express";
import QRCode from "qrcode";
import { auth, requiredScopes } from "express-oauth2-jwt-bearer";
import { getPasses } from "./queries/getPasses.ts";
import { getPassById } from "./queries/getPassById.ts";
import { createPass } from "./queries/createPass.ts";

const app = express();

const checkJwt = auth({
  issuerBaseURL: process.env.AUTH_SERVER,
  audience: process.env.AUTH_AUDIENCE,
});

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port =
  externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;
const baseURL = externalUrl || `http://localhost:${port}`;
const hostname = externalUrl ? "0.0.0.0" : "localhost";

app.get("/", async (req, res) => {
  const passes = await getPasses();
  res.json(passes);
});

app.get<{ id: string }>(
  "/passes/:id",
  checkJwt,
  requiredScopes("read:passes"),
  async (req, res) => {
    const passId = req.params.id;
    const pass = await getPassById(passId);
    if (!pass) {
      res.sendStatus(404);
      return;
    }
    res.json(pass);
  },
);

app.post(
  "/passes",
  checkJwt,
  requiredScopes("create:passes"),
  express.json(),
  async (req, res) => {
    const name: unknown = req.body?.name;
    const document: unknown = req.body?.document;

    if (
      typeof name !== "string" ||
      name.trim() === "" ||
      typeof document !== "string" ||
      document.trim() === ""
    ) {
      res.sendStatus(400);
      return;
    }

    const newPass = await createPass(name, document);

    const qrCode = await QRCode.toBuffer(`${baseURL}/info/${newPass.id}`);

    res.location(`${baseURL}/passes/${newPass.id}`);
    res.status(201).type("png").send(qrCode);
  },
);

app.listen(port, hostname, () => {
  console.log(`Server locally running at http://${hostname}:${port}`);
  if (externalUrl) console.log(`External URL: ${externalUrl}`);
});
