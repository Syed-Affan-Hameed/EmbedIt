import { Request, Response } from "express";
import { OpenAI } from "openai"; // Adjust the import based on your actual library
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";
import path from "path";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let assistantId: string = ""; //asst_uCbpp0XvOkNM2VH0I03rFIcd
let threadId: string = ""; //thread_8x3gfVWpT699k17Xt57GfYew
let vectorStoreId: string = ""; //vctr_8x3gfVWpT699k17Xt57GfYew

// Configure multer for file uploads
export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./backend/src/uploads"); // Directory where files will be stored
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`); // Unique file name
    },
  }),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = [".pdf", ".txt", ".docx", ".json"]; // Allowed file types
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error("Only pdf, txt, docx, and json files are allowed!"));
    }
    cb(null, true);
  },
});

export const createAssistantAndVectorStore = async (
  req: Request,
  res: Response
) => {
  try {
    const topic = req.body.topicName; // Expect topicName in the request body
    const assistant = await openai.beta.assistants.create({
      name: `AI Assistant`,
      instructions:
        `You are an expert in ${topic}. Use your knowledge base to answer questions related to ${topic}.`,
      model: "gpt-3.5-turbo",
      tools: [{ type: "file_search" }],
    });
    // Create a vector store and store the ID for later use
    const vectorStore = await openai.beta.vectorStores.create({
      name: "User Uploaded Documents",
    });
    vectorStoreId = vectorStore.id;
    assistantId = assistant.id;
    console.log(assistant);
    res.status(200).json({
      success: true,
      message: "Success: Assistant created successfully",
      assistant,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create an assistant",
      error: error.message,
    });
  }
};


function convertPath(path:string) {
  return path.replace(/\\/g, '/');
}

export const addDocumentstoVectorStore = async (req: Request, res: Response) => {
  try {
    console.log("Received file:", req.file);
    console.log("Received body:", req.body);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = convertPath(req.file.path);

    const fileStreams = [filePath].map((path) =>
      fs.createReadStream(path),
    );
   
    const uploadAndPollResult = await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStoreId,    {
                 files: fileStreams,
      })

    await fs.promises.unlink(filePath);

    res.status(200).json({
      success: true,
      message: "Vector Store created and document added successfully.",
      uploadAndPollResult,
    });
  } catch (error: any) {
    console.log("Error!!:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


export const createThread = async (req: Request, res: Response) => {
  try {
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content:
            "Give me brief summary of the attached document in 100 words?",
        },
      ],
    });
    // setting the thread id for global access.
    threadId = thread.id;

    res.status(200).json({
      messages: "Step 3] Successful created a thread" + "id:" + threadId,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


export const askQuestions = async (req: Request, res: Response) => {
  const followUpQuestion = req.body.question; // Expect followUpQuestion in the request body

  try {

    if (!threadId) {
      return res.status(400).json({
        error: "Thread ID is not initialized. Create a thread first.",
      });
    }

    // Add the follow-up question to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: followUpQuestion,
    });

    // Run the assistant and fetch its response
    const responseText = await runAssistantWithCitations(threadId, assistantId);

    res.status(200).json({
      message: "Follow-up question added and assistant responded successfully.",
      followUpQuestion,
      response: responseText,
      citations: responseText.citations,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};





///////////////////////


export const createVectorStoreAndAddDocuments = async (
  req: Request,
  res: Response
) => {
  try {
    const fileStreams = [
      "./backend/src/data/howtoselectembeddingmodelsample.pdf",
    ].map((path) => fs.createReadStream(path));

    // Create a vector store including our two files.
    let vectorStore = await openai.beta.vectorStores.create({
      name: "Embedding Models information",
    });
    const uploadAndPollResult =
      await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
        files: fileStreams, // Wrap the fileStreams array in an object with the 'files' key
      });

    await openai.beta.assistants.update(assistantId, {
      tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
    });

    res.status(200).json({
      message:
        "Step 2] Complete: Vector Store created and documents added successfully",
      vectorStore,
      uploadAndPollResult,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createThread2 = async (req: Request, res: Response) => {
  try {
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content:
            "Give me accurate answers from the document i have uploaded",
        },
      ],
    });
    // setting the thread id for global access.
    threadId = thread.id;

    res.status(200).json({
      messages: "Step 3] Successful created a thread" + "id:" + threadId,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const askQuestions2 = async (req: Request, res: Response) => {
  const followUpQuestion = req.body.question; // Expect followUpQuestion in the request body

  try {

    if (!threadId) {
      return res.status(400).json({
        error: "Thread ID is not initialized. Create a thread first.",
      });
    }

    // Add the follow-up question to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: followUpQuestion,
    });

    // Run the assistant and fetch its response
    const responseText = await runAssistantWithCitations(threadId, assistantId);

    res.status(200).json({
      message: "Follow-up question added and assistant responded successfully.",
      followUpQuestion,
      response: responseText,
      citations: responseText.citations,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};



export const createRun = async (req: Request, res: Response) => {
  try {
    const { text, citations } = await runAssistantWithCitations(
      threadId,
      assistantId
    );

    res.status(200).json({
      message: "Run created successfully",
      text,
      citations,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};




export const addFollowUp = async (req: Request, res: Response) => {
  const followUpQuestion = req.body.question; // Expect followUpQuestion in the request body

  try {
    const t = threadId;
    if (!threadId) {
      return res.status(400).json({
        error: "Thread ID is not initialized. Create a thread first.",
      });
    }

    // Add the follow-up question to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: followUpQuestion,
    });

    // Run the assistant and fetch its response
    const responseText = await runAssistantWithCitations(threadId, assistantId);

    res.status(200).json({
      message: "Follow-up question added and assistant responded successfully.",
      followUpQuestion,
      response: responseText,
      citations: responseText.citations,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const runAssistantWithCitations = async (
  threadId: string,
  assistantId: string
) => {
  try {
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId,
    });

    const messages = await openai.beta.threads.messages.list(threadId, {
      run_id: run.id,
    });

    // Extract the latest message from the assistant
    const lastMessage = messages.data.pop();
    if (lastMessage?.content[0]?.type === "text") {
      const { text } = lastMessage.content[0];
      const { annotations } = text;
      const citations: string[] = [];

      let index = 0;
      for (let annotation of annotations) {
        text.value = text.value.replace(annotation.text, `[${index}]`);
        //@ts-ignore
        const { file_citation } = annotation;
        if (file_citation) {
          const citedFile = await openai.files.retrieve(file_citation.file_id);
          citations.push(`[${index}] ${citedFile.filename}`);
        }
        index++;
      }

      return { text: text.value, citations };
    }

    return { text: "No response received.", citations: [] };
  } catch (error: any) {
    throw new Error(`Failed to run assistant: ${error.message}`);
  }
};
