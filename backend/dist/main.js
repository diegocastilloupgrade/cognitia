"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const modules_1 = require("./modules");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = Number(process.env.PORT ?? 3000);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api", modules_1.apiRouter);
app.listen(port, () => {
    console.log(`COGNITIA backend listening on http://localhost:${port}`);
});
