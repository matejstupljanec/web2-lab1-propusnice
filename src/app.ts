import "dotenv/config";
import express from "express";
import { getPasses } from "./queries/getPasses.ts";
import { getPassById } from "./queries/getPassById.ts";

const app = express();

app.get("/", async (req, res) => {
  const passes = await getPasses();
  res.json(passes);
});

app.get("/passes/:id", async (req, res) => {
  const passId = req.params.id;
  const pass = await getPassById(passId);
  if (!pass) {
    res.sendStatus(404);
    return;
  }
  res.json(pass);
});

app.post("/passes", (req, res) => {
  res.status(201);
});

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port =
  externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;
const baseURL = externalUrl || `http://localhost:${port}`;

const hostname = externalUrl ? "0.0.0.0" : "localhost";
app.listen(port, hostname, () => {
  console.log(`Server locally running at http://${hostname}:${port}`);
  if (externalUrl) console.log(`External URL: ${externalUrl}`);
});
