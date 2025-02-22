import express from "express";
import { addDocumentstoVectorStore, addFollowUp, createAssistantAndVectorStore, createRun, createThread, createVectorStoreAndAddDocuments, upload } from "../controllers/embedit.controller.js";

const embeditRouter = express.Router();


embeditRouter.post("/createAssistantWithVectorStore",async (req, res) => {
    await createAssistantAndVectorStore(req, res);
});

embeditRouter.post("/addDocuments", upload.single("file"),async (req, res) => {
    await addDocumentstoVectorStore(req, res);
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