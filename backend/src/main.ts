import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { apiRouter } from "./modules";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.listen(port, () => {
  console.log(`COGNITIA backend listening on http://localhost:${port}`);
});
