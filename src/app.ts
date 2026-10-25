import "dotenv/config";
import path from "path";
import express from "express";
import QRCode from "qrcode";
import oidc from "express-openid-connect";
import jwtBearer from "express-oauth2-jwt-bearer";
import type { Pass } from "./pass.ts";
import { getPasses } from "./queries/getPasses.ts";
import { getPassById } from "./queries/getPassById.ts";
import { createPass } from "./queries/createPass.ts";
import { getPassStats } from "./queries/getPassStats.ts";
import { updatePass } from "./queries/updatePass.ts";
import { deletePass } from "./queries/deletePass.ts";

const app = express();

app.set("views", path.join(import.meta.dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(import.meta.dirname, "public")));

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port =
  externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;
const baseURL = externalUrl || `http://localhost:${port}`;
const hostname = externalUrl ? "0.0.0.0" : "localhost";

const config = {
  authRequired: false,
  idpLogout: true,
  secret: process.env.SESSION_SECRET,
  baseURL: baseURL,
  clientID: process.env.OIDC_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
  clientSecret: process.env.OIDC_CLIENT_SECRET,
  routes: {
    logout: false as const,
  },
  authorizationParams: {
    response_type: "code",
  },
};
app.use(oidc.auth(config));

const checkJwt = jwtBearer.auth({
  issuerBaseURL: process.env.AUTH0_DOMAIN,
  audience: process.env.API_AUDIENCE,
});

app.post("/logout", (req, res) => res.oidc.logout());

app.get("/", async (req, res) => {
  let username: string | undefined;
  let passes: Pass[] | undefined;
  if (req.oidc.isAuthenticated()) {
    username = req.oidc.user?.name ?? req.oidc.user?.sub;
    passes = await getPasses();
  }
  const stats = await getPassStats();
  res.render("index", { username, stats, passes });
});

app.patch<{ id: string }>(
  "/admin/passes/:id",
  oidc.requiresAuth(),
  async (req, res) => {
    const passId = req.params.id;
    const updated = await updatePass(passId, "CANCELLED");
    res.sendStatus(updated ? 200 : 404);
  },
);

app.delete<{ id: string }>(
  "/admin/passes/:id",
  oidc.requiresAuth(),
  async (req, res) => {
    const passId = req.params.id;
    const deleted = await deletePass(passId);
    res.sendStatus(deleted ? 204 : 404);
  },
);

app.get<{ id: string }>("/info/:id", async (req, res) => {
  const passId = req.params.id;
  const pass = await getPassById(passId);
  if (!pass) {
    res.status(404).send("Propusnica ne postoji");
    return;
  }
  res.render("info", { pass });
});

app.get<{ id: string }>(
  "/passes/:id",
  checkJwt,
  jwtBearer.requiredScopes("read:passes"),
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
  jwtBearer.requiredScopes("create:passes"),
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
