# PeerLift

## AI-Powered Peer Learning and Skill Exchange

PeerLift is a high-performance, community-oriented platform designed to eliminate financial barriers to learning. By leveraging advanced AI reasoning and peer-to-peer collaboration, PeerLift empowers users to trade skills and knowledge in a structured, trustworthy environment.

---

## Core Features

### 1. Lumina AI Tutor
Lumina is an elite peer tutoring engine integrated directly into the learning workspace. It provides detail-oriented instruction, step-by-step guidance, and real-time support for a wide range of academic and technical subjects.

### 2. Reasoning Engine (Thinking Mode)
The platform utilizes a DeepSeek-R1 Distilled Llama 70B reasoning model to provide deep, analytical breakthroughs. 
*   **Logical Traces**: Users can expand the "Thinking" accordion to view the AI's internal monologue and step-by-step logic.
*   **Complex Problem Solving**: Designed for systemic explanations and architectural breakdowns.

### 3. Multimodal Workspace
*   **Document Ingestion**: Seamlessly upload and parse PDF, DOCX, and Image files (via OCR) to provide context to the AI tutor.
*   **Mermaid.js Integration**: Automatically renders complex system diagrams, flowcharts, and technical layouts directly in the chat interface.
*   **Web-Enabled Tools**: Built-in search capabilities allow the AI to access real-time technical documentation and late-breaking information.

### 4. Premium Audio Interface
*   **Natural Voice TTS**: A high-fidelity text-to-speech system with natural voice heuristics.
*   **Interactive Controls**: Real-time play/stop functionality with cleaned scripts that omit technical code or markup for a pure spoken experience.
*   **Voice Mode**: Real-time speech recognition for hands-free tutoring sessions.

---

## Technology Stack

### Frontend
*   **Next.js 14 (App Router)**: Utilizing Server Components and optimized routing.
*   **TypeScript**: Strict type safety across the entire application.
*   **Tailwind CSS**: A custom design system with glassmorphism and modern UI tokens.
*   **Lucide React**: Scalable, high-performance icon library.

### Backend
*   **Vercel AI SDK**: Modern data streaming and tool execution.
*   **Groq Cloud API**: Ultra-low latency inference for Llama 3.3 and DeepSeek-R1 models.
*   **Prisma ORM**: Type-safe database management.
*   **Cheerio & Tesseract.js**: Advanced data scraping and OCR processing.

### Infrastructure
*   **Docker**: Fully containerized environment for consistent deployment.
*   **PostgreSQL**: Robust relational database for session management.

---

## Getting Started

### Local Development

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Firojpaudel/PeerLift.git
    cd PeerLift
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env.local` file based on the `.env.example` provided. Register for a Groq API Key at console.groq.com.

4.  **Initialize Database**:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

### Docker Deployment

To launch the entire stack (Database and App) using Docker Compose:

```bash
docker-compose up --build
```

The application will be accessible at `http://localhost:3000`.

---

## Security and Compliance

PeerLift implements strict security protocols:
*   **Environment Isolation**: Sensitive keys are managed via environment variables and never hardcoded in the codebase.
*   **Data Serialization**: Automatic cleaning of AI monologues and internal traces for public-facing interfaces.
*   **Sanitization Pipelines**: Specialized engines for sanitizing technical diagrams and markdown to prevent injection or rendering failures.
