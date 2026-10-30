AI Resume Builder
An AI-powered Resume Builder that helps users create, improve, and manage professional resumes through an intelligent conversational interface.

Instead of filling out a traditional resume form, users interact with an AI assistant that collects their information step by step, understands their requirements, validates the collected data, and generates a structured, professional resume.

The application uses an AI-powered workflow built with LangChain and LangGraph, a Node.js and Express.js backend, and MongoDB for persistent data storage.

Table of Contents
Project Overview

Key Features

Technology Stack

System Architecture

AI Agent Workflow

Conversation Flow

Intent Detection

Requirement Collection

Resume Generation Pipeline

Database Design

Backend Project Structure

API Documentation

Installation and Setup

Environment Variables

How to Run the Project

Screenshots

Future Improvements

🚀 Project Overview
AI Resume Builder is an intelligent resume-generation application designed to simplify the resume creation process.

The application uses a conversational AI agent that interacts with users and collects all the necessary information before generating a resume.

The agent does not immediately generate a resume after receiving a single message. Instead, it follows a structured workflow:

Understands the user's intent.

Identifies whether the user wants to create, update, or improve a resume.

Collects relevant personal and professional information.

Determines whether the candidate is a fresher or an experienced professional.

Asks questions dynamically based on the candidate's experience type.

Validates the collected information.

Presents a complete resume preview for approval.

Generates and saves the final resume.

Main Objective
To build an AI-powered resume assistant that provides a personalized, guided, and structured resume creation experience.

✨ Key Features
1. AI-Powered Conversational Interface
Interactive chatbot-based resume creation.

Natural language understanding.

Dynamic question generation.

Context-aware conversations.

Step-by-step information collection.

2. Multiple Resume Operations
Create a new resume.

Update an existing resume.

Improve an existing resume.

Generate a new version of an improved resume.

3. Dynamic Requirement Collection
The AI agent collects information such as:

Target job role

Technical and professional skills

Experience type

Work experience

Education

Internships

Projects

Achievements

Certifications

Professional summary

GitHub, LinkedIn, portfolio, and other professional links

4. Fresher and Experienced Candidate Support
The workflow changes based on the candidate's experience type.

Fresher workflow:

Target job role

Skills

Experience type

Education

Internships

Projects

Achievements

Certifications

Professional summary

Professional links

Resume review

Experienced workflow:

Target job role

Skills

Experience type

Work experience

Education

Internships

Projects

Achievements

Certifications

Professional summary

Professional links

Resume review

5. Resume Validation and Approval
Validates collected information.

Maintains structured resume requirements.

Allows users to review their information.

Generates the final resume only after approval.

6. Resume Generation
Structured resume content.

PDF generation.

Resume version management.

Resume download support.

Option to generate a single-page resume when requested.

7. Conversation and Session Management
Maintains chat sessions.

Stores conversation messages.

Retrieves previous chat history.

Maintains workflow state across conversation turns.

🛠 Technology Stack
Technology	Purpose
React.js	Frontend user interface
Node.js	Backend runtime
Express.js	REST API development
MongoDB	Database
Mongoose	MongoDB object modeling
Firebase Authentication	User authentication
LangChain	LLM integration and message handling
LangGraph	Stateful AI workflow orchestration
Zod	Structured data validation
Groq / Configured LLM Provider	AI model inference
PDF Generation Library	Resume PDF generation
Update the LLM provider and PDF library names according to the exact packages configured in your project.

🏗 System Architecture
The application follows a frontend-backend-AI workflow architecture.

flowchart TD
    A[User] --> B[React Frontend]
    B --> C[Express REST API]
    C --> D[Authentication]
    C --> E[Chat Controller]
    E --> F[Chat Service]
    F --> G[LangGraph Workflow]
    G --> H[LLM Provider]
    G --> I[Requirement Management]
    G --> J[Validation]
    J --> K[Resume Generation]
    K --> L[PDF Document]
    F --> M[(MongoDB)]
    K --> M
    L --> N[Resume Download]
Architecture Responsibilities
Frontend

User interaction.

Chat interface.

Resume preview.

Resume download.

Session history.

Backend

API management.

Authentication.

Chat session management.

Database operations.

AI workflow execution.

AI Workflow

Intent detection.

Information extraction.

Requirement management.

Dynamic question selection.

Resume validation.

Resume generation.

Database

User information.

Chat sessions.

Chat messages.

Resume records and versions.

🤖 AI Agent Workflow
The most important component of this project is its LangGraph-based AI workflow.

The agent follows a stateful workflow instead of processing every message independently.

Main Workflow Diagram
flowchart TD
    A([START]) --> B{User Message Exists?}
    B -->|No| C[Greeting Node]
    B -->|Yes| D[Understand Message Node]
    C --> Z([END])
    D --> E[Update Requirements Node]
    E --> F{Resume Approved?}
    F -->|Yes| G[Validate and Save Node]
    F -->|No| H[Select Next Step Node]
    H --> G
    G --> I{Validation Approved?}
    I -->|Yes| J[Generate Resume Node]
    I -->|No| Z
    J --> Z([END])
Workflow Nodes
1. Greeting Node
Welcomes the user and asks what they want to do.

Example:

Hello! How can I assist you today? Would you like to create a new resume or update an existing one?

2. Understand Message Node
Analyzes the latest user message and extracts structured information.

Responsibilities:

Understand user intent.

Extract resume information.

Identify section-related actions.

Detect resume format preferences.

Identify approval requests.

3. Update Requirements Node
Updates the current resume requirements using extracted information.

Each requirement maintains a structured status and value.

Example:

{
  experienceType: {
    status: "answered",
    value: "experienced",
    updatedAt: "2026-10-30T10:00:00.000Z"
  }
}
4. Select Next Step Node
Determines the next question based on:

Current workflow step.

Candidate experience type.

Missing requirements.

Requirement status.

User's requested section.

Current resume intent.

5. Validate and Save Node
Validates collected information and handles the approval process before resume generation.

6. Generate Resume Node
Generates the resume using the confirmed information and stores the generated resume details.

🔄 Conversation Flow
The application uses different question sequences for freshers and experienced candidates.

Fresher Flow
flowchart TD
    A[Start Resume Creation] --> B[Target Job Role]
    B --> C[Technical Skills]
    C --> D[Experience Type: Fresher]
    D --> E[Education Details]
    E --> F[Internships]
    F --> G[Projects]
    G --> H[Achievements]
    H --> I[Certifications]
    I --> J[Professional Summary]
    J --> K[Professional Links]
    K --> L[Resume Review]
    L --> M[User Approval]
    M --> N[Generate Resume]
Experienced Candidate Flow
flowchart TD
    A[Start Resume Creation] --> B[Target Job Role]
    B --> C[Technical Skills]
    C --> D[Experience Type: Experienced]
    D --> E[Work Experience]
    E --> F[Education Details]
    F --> G[Internships]
    G --> H[Projects]
    H --> I[Achievements]
    I --> J[Certifications]
    J --> K[Professional Summary]
    K --> L[Professional Links]
    L --> M[Resume Review]
    M --> N[User Approval]
    N --> O[Generate Resume]
The workflow ensures that experienced candidates provide their professional work history before education details, while freshers start with their education.

🎯 Intent Detection
The AI agent supports multiple resume-related intents.

Intent	Description
undecided	User intent is not yet identified
create_resume	Create a new resume
update_resume	Update an existing resume
improve_resume	Improve an existing resume
Intent Workflow
flowchart TD
    A[User Message] --> B[Intent Detection]
    B --> C{Detected Intent}
    C -->|create_resume| D[Collect Requirements]
    C -->|update_resume| E[Select Existing Resume]
    C -->|improve_resume| F[Improve Existing Resume]
    C -->|undecided| G[Ask User Intent]
    D --> H[Resume Review]
    E --> H
    F --> I[Confirm Improvement]
    I --> J[Generate Improved Version]
📋 Requirement Collection
The AI agent collects information in structured sections.

Section	Information Collected
Target Role	Desired job title
Skills	Technical and professional skills
Experience Type	Fresher or experienced
Work Experience	Company, designation, dates, responsibilities
Education	Degree, institution, graduation year, field of study
Internships	Organization, designation, duration, responsibilities
Projects	Project name, technologies, role, description, URLs
Achievements	Awards and accomplishments
Certifications	Certification name, issuer, date, credential URL
Professional Summary	Manually provided or AI-generated
Links	GitHub, LinkedIn, portfolio, LeetCode
Requirement Status Management
Each requirement has a status.

export const REQUIREMENT_STATUS = {
    PENDING: "pending",
    IN_PROGRESS: "in_progress",
    ANSWERED: "answered",
    COMPLETED: "completed",
    CONFIRMED: "confirmed",
    NOT_APPLICABLE: "not_applicable",
};
This allows the workflow to track which information has been collected and which sections still need user input.

📄 Resume Generation Pipeline
Resume generation follows a controlled process.

flowchart TD
    A[Collected Requirements] --> B[Resume Review]
    B --> C{User Approved?}
    C -->|No| D[Update Requested Section]
    D --> B
    C -->|Yes| E[Validate Requirements]
    E --> F[Build Resume Prompt]
    F --> G[LLM Generates Structured Content]
    G --> H[Zod Schema Validation]
    H --> I[Normalize Resume Content]
    I --> J[Remove Duplicate Information]
    J --> K[Generate PDF]
    K --> L[Save Resume and Version]
    L --> M[Return Download Information]
Generation Principles
Use only confirmed information from the current resume requirements.

Do not invent work experience, education, achievements, or skills.

Avoid duplicate sections and repeated information.

Validate generated content against the expected schema.

Preserve the user's actual information.

Generate the requested output format.

🗄 Database Design
The application uses MongoDB with Mongoose.

The following is a conceptual database design. Adapt the fields and relationships to your actual Mongoose schemas.

1. Users Collection
Stores user account information.

{
  _id: ObjectId,
  firebaseUid: String,
  name: String,
  email: String,
  createdAt: Date,
  updatedAt: Date
}
2. Chat Sessions Collection
Stores individual resume-building sessions.

{
  _id: ObjectId,
  userId: ObjectId,
  intent: String,
  currentStep: String,
  pendingQuestion: String,
  requirements: Object,
  approvalStatus: String,
  createdAt: Date,
  updatedAt: Date
}
3. Chat Messages Collection
Stores user and AI conversation messages.

{
  _id: ObjectId,
  sessionId: ObjectId,
  role: String,
  content: String,
  createdAt: Date
}
4. Resumes Collection
Stores generated resume information.

{
  _id: ObjectId,
  userId: ObjectId,
  sessionId: ObjectId,
  title: String,
  fileName: String,
  downloadUrl: String,
  format: String,
  createdAt: Date,
  updatedAt: Date
}
5. Resume Versions Collection
Stores different versions of a resume.

{
  _id: ObjectId,
  resumeId: ObjectId,
  versionNumber: Number,
  content: Object,
  fileName: String,
  downloadUrl: String,
  createdAt: Date
}
📁 Backend Project Structure
Example modular backend organization:

backend/
│
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── firebase.js
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── chat/
│   │   └── resume/
│   │
│   ├── aiWorkflow/
│   │   ├── constants/
│   │   │   └── workflow.constants.js
│   │   │
│   │   ├── workflow/
│   │   │   ├── workflow.graph.js
│   │   │   └── workflow.state.js
│   │   │
│   │   ├── understand-message.js
│   │   ├── update-requirements.js
│   │   ├── select-next-step.js
│   │   ├── validate-and-save.js
│   │   └── generate-resume.js
│   │
│   ├── middleware/
│   ├── utils/
│   ├── app.js
│   └── server.js
│
├── .env
├── .env.example
└── package.json
This is an illustrative structure. Adjust it to match the actual repository.

🔌 API Documentation
The following is an example API organization. Replace the example routes with your actual Express routes.

Method	Endpoint	Purpose
POST	/api/auth/...	Authentication
POST	/api/chat/sessions	Create a chat session
GET	/api/chat/sessions	Get chat sessions
GET	/api/chat/sessions/:sessionId/messages	Get session messages
POST	/api/chat/sessions/:sessionId/messages	Send a chat message
GET	/api/resumes	Get user resumes
GET	/api/resumes/:resumeId	Get resume details
GET	/api/resumes/:resumeId/download	Download resume
⚙️ Installation and Setup
Prerequisites
Install the following:

Node.js

npm

MongoDB

Firebase project

API key for your configured LLM provider

1. Clone the Repository
git clone https://github.com/ganeshk6/ai-resume-builder-agent
cd ai-resume-builder
2. Install Backend Dependencies
cd backend
npm install
3. Configure Environment Variables
Create a .env file in the backend directory.

PORT=3001

MONGODB_URI=your_mongodb_connection_string

FRONTEND_URL=http://localhost:5173

FIREBASE_PROJECT_ID=your_firebase_project_id

GROQ_API_KEY=your_groq_api_key

GROQ_MODEL=your_configured_model
Add any additional environment variables required by your actual implementation.

4. Start the Backend
npm run dev
5. Install Frontend Dependencies
Open another terminal:

cd frontend
npm install
6. Start the Frontend
npm run dev
Open the frontend URL displayed in your terminal.

🔐 Environment Variables
Variable	Description
PORT	Backend server port
MONGODB_URI	MongoDB connection string
FRONTEND_URL	Frontend application URL
FIREBASE_PROJECT_ID	Firebase project identifier
GROQ_API_KEY	LLM provider API key
GROQ_MODEL	Configured LLM model
Security: Never commit .env, Firebase private credentials, API keys, or database credentials to GitHub.

🖼 Screenshots
Add actual application screenshots in the repository under:

docs/
└── screenshots/
    ├── home.png
    ├── login.png
    ├── chat-interface.png
    ├── experience-details.png
    ├── education-details.png
    ├── resume-review.png
    └── generated-resume.png
Once the screenshots are added, display them using:

Application Dashboard


AI Chat Interface


Resume Review


Generated Resume


🚀 Future Improvements
Multiple professional resume templates.

DOCX export support.

ATS compatibility analysis.

Resume scoring and recommendations.

Job description-based resume customization.

AI-powered cover letter generation.

LinkedIn profile integration.

Resume analytics and version comparison.

More advanced resume editing tools.

Deployment with Docker and CI/CD.

🔒 Security Considerations
Protect API routes with authentication middleware.

Validate incoming requests.

Keep API keys in environment variables.

Apply ownership checks before accessing resumes and sessions.

Avoid exposing sensitive user information.

Sanitize and validate generated file operations.

🤝 Contributing
Contributions, feature suggestions, and bug reports are welcome.

Fork the repository.

Create a feature branch.

Commit your changes.

Push your branch.

Open a Pull Request.

📜 License
Choose and add a license before publishing the project publicly. For example, MIT License.

👨‍💻 Author
Ganesh Kumar

GitHub: [Ganesh Kumar](https://github.com/ganeshk6)

LinkedIn: [Ganesh Kumar](https://www.linkedin.com/in/ganesh-kumar-47988621b/)

⭐ If you find this project useful, consider giving it a star!