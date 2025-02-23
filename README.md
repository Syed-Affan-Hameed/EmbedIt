# EmbedIt

EmbedIt is a web application that allows users to upload documents, create AI assistants, and interact with the documents through chat. The application leverages OpenAI's API to create assistants and vector stores for document analysis.

## Features

- Upload documents (PDF, TXT, DOCX, JSON)
- Create AI assistants to analyze documents
- Chat with the AI assistant to get insights from the documents
- Manage recent files and topics

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API Key

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/EmbedIt.git
   cd EmbedIt
   ```

2. Install dependencies for both backend and frontend:

   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

3. Create a `.env` file in the `backend` directory and add your OpenAI API key:

   ```env
   OPENAI_API_KEY=your_openai_api_key
   ```

## Running the Application

1. Start the backend server:

   ```bash
   cd backend
   npm start
   ```

   The backend server will run on `http://localhost:5009`.

2. Start the frontend development server:

   ```bash
   cd frontend
   npm start
   ```

   The frontend server will run on `http://localhost:3000`.

## API Endpoints

### Backend

- `POST /api/v1/embedit/createAssistantWithVectorStore`
  - Create an AI assistant and a vector store for document analysis.
  - Request body: `{ "topicName": "string" }`

- `POST /api/v1/embedit/addDocuments`
  - Upload documents and add them to the vector store.
  - Request body: FormData with file and topicName

- `POST /api/v1/embedit/askQuestions`
  - Ask questions to the AI assistant.
  - Request body: `{ "question": "string" }`

### Frontend

- Upload documents through the sidebar interface.
- Create AI assistants and manage recent files.

## Project Structure

### Backend

- `src/controllers/embedit.controller.ts`: Contains the main logic for handling file uploads, creating assistants, and interacting with OpenAI API.
- `src/uploads`: Directory where uploaded files are stored temporarily.

### Frontend

- `src/components/Sidebar.tsx`: Component for the sidebar interface where users can upload files and create assistants.
- `src/components/ChatInterface.tsx`: Component for the chat interface to interact with the AI assistant.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License

This project is licensed under the MIT License.
