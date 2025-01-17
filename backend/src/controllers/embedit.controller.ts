import { Request, Response } from "express";
import { OpenAI } from "openai"; // Adjust the import based on your actual library
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let assistantId :string ="";
let threadId: string = "";


export const createAssistant = async (req: Request, res: Response) => {

    try {
        const assistant = await openai.beta.assistants.create({
            name: "Embedding Model Selection Assistant",
            instructions: "You are an in Selecting Embedding Models. Use your knowledge base to answer questions about selecting the right Embedding models for the development of LLM driven AI-Applications.",
            model: "gpt-3.5-turbo",
            tools: [{ type: "file_search" }],
          });
          assistantId=assistant.id;
          console.log(assistant);
          res.status(200).json({ message: "Step 1] Complete: Assistant created successfully"}); 
    } catch (error:any) {
        res.status(500).json({ error: error.message });
        
    }

}

export const createVectorStoreAndAddDocuments = async (req: Request, res: Response) => {
    try {
        const fileStreams = ["./data/howtoselectembeddingmodelsample.pdf"].map((path) =>
            fs.createReadStream(path),
            );
            
            // Create a vector store including our two files.
            let vectorStore = await openai.beta.vectorStores.create({
            name: "Embedding Models information",
            });
            //@ts-ignore
            const uploadAndPollResult = await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, fileStreams);
            console.log("This may be polling data",uploadAndPollResult);
    
            res.status(200).json({ message: "Step 2] Complete: Vector Store created and documents added successfully"});
    
    } catch (error:any) {
        res.status(500).json({ error: error.message });
        
    }

}

export const createThread  = async (req: Request, res: Response) => {
try {
    const thread = await openai.beta.threads.create({
        messages: [
          {
            role: "user",
            content:
              "Can you tell me something about the importance of embeddings in AI?",
          },
        ]
        });
        // setting the thread id for global access.
        threadId = thread.id;

        res.status(200).json({messages:"Step 3] Successful created a thread"+"id:" +threadId})
} catch (error:any) {
    res.status(500).json({error:error.message});
}
   
}


export const createRun =async(req: Request, res: Response) => {

    try {

        const run = await openai.beta.threads.runs.createAndPoll(threadId, {
            assistant_id: assistantId,
            });
            
            const messages = await openai.beta.threads.messages.list(threadId, {
            run_id: run.id,
            });
            
            const message = messages.data.pop()!;
            if (message.content[0].type === "text") {
            const { text } = message.content[0];
            const { annotations } = text;
            const citations: string[] = [];
            
            let index = 0;
            for (let annotation of annotations) {
              text.value = text.value.replace(annotation.text, "[" + index + "]");
              //@ts-ignore
              const { file_citation } = annotation;
              if (file_citation) {
                const citedFile = await openai.files.retrieve(file_citation.file_id);
                citations.push("[" + index + "]" + citedFile.filename);
              }
              index++;
            }
            
            console.log(text.value);
            console.log(citations.join("\n"));
            }

    } catch (error:any) {
        res.status(500).json({error:error.message});
    }

}