import express from "express";
import { addFollowUp, createAssistant, createRun, createThread, createVectorStoreAndAddDocuments } from "../controllers/embedit.controller.js";

const embeditRouter = express.Router();


embeditRouter.post("/createAssistant",async (req, res) => {
    await createAssistant(req, res);
});
embeditRouter.post("/createVectorStoreAndAddDocuments",async (req, res) => {
    await createVectorStoreAndAddDocuments(req, res);
});
embeditRouter.post("/createThread",async (req, res) => {
    await createThread(req, res);
});
embeditRouter.post("/createRun",async (req, res) => {
    await createRun(req, res);
});
embeditRouter.post("/addFollowUp",async (req, res) => {
    await addFollowUp(req, res);
});

export default embeditRouter;