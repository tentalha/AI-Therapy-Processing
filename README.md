# 🧠 AI Therapy Session Analysis

An intelligent platform that transforms therapy session recordings into actionable insights using advanced artificial intelligence. Upload your audio files and let AI handle the transcription, analysis, and organization.

## ✨ What Does It Do?

This application helps therapists and counselors by automatically:
- 📝 **Transcribing** therapy sessions with speaker identification (Therapist/Client)
- 🤖 **Generating summaries** of each session using AI
- 🎯 **Identifying key topics** and themes discussed
- 💭 **Analyzing sentiment** to understand emotional tone
- 🔍 **Making sessions searchable** using natural language queries
- 📊 **Visualizing insights** with an easy-to-use interface

## 🎯 Key Features

### Intelligent Audio Processing
- **Upload & Transcribe**: Drop your audio file (mp3, wav, m4a) and get an accurate transcription with speaker labels
- **AI Summaries**: Get concise, AI-generated summaries highlighting the main points of each session
- **Topic Extraction**: Automatically identify and tag key discussion topics
- **Sentiment Analysis**: Understand the emotional tone (positive, negative, neutral, mixed)
- **Duration Detection**: Automatic audio duration extraction and display

### Smart Search
- **Semantic Search**: Find sessions using natural language - search for "anxiety coping strategies" and find relevant sessions even if those exact words weren't used
- **Similarity Scoring**: See how closely each result matches your search query
- **Fast Results**: Get top 5 most relevant matches instantly

### User-Friendly Interface
- **Modern Design**: Clean, professional interface with emerald-green theme
- **Dark Mode**: Easy on the eyes with full dark mode support
- **Audio Player**: Built-in player to listen to recordings directly in the app
- **Download Options**: Export audio files and transcriptions with one click
- **Responsive**: Works perfectly on desktop, tablet, and mobile

### Data Management
- **Secure Storage**: All files stored securely in Supabase with encryption
- **Unique Filenames**: Automatic generation of unique filenames to prevent conflicts
- **HIPAA Compliant**: Built with privacy and security in mind
- **Vector Embeddings**: Advanced AI embeddings (1536 dimensions) for semantic understanding

## 🛠️ Technology Stack

### Frontend (Client)
- **Next.js 15+** - React framework for the user interface
- **TypeScript** - Type-safe JavaScript for better code quality
- **Tailwind CSS** - Modern styling with emerald-green gradient theme
- **Axios** - HTTP client for API communication
- **React Hooks** - Modern state management

### Backend (Server)
- **NestJS** - Robust Node.js framework
- **OpenAI API** - Powers transcription, summaries, and embeddings
  - Whisper for transcription
  - GPT-4o-mini for analysis
  - text-embedding-3-small for semantic search
- **Supabase** - Backend-as-a-Service providing:
  - PostgreSQL database with pgvector extension
  - File storage for audio recordings
  - Real-time capabilities
- **music-metadata** - Extract audio file duration

## 🚀 Getting Started

### Prerequisites

Before you begin, make sure you have:
- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **pnpm** package manager - Install with `npm install -g pnpm`
- **Supabase Account** - [Sign up free](https://supabase.com/)
- **OpenAI API Key** - [Get your key](https://platform.openai.com/api-keys)
- **Git** - For cloning the repository

### Step-by-Step Installation

#### 1️⃣ Clone the Repository
```bash
git clone <repository-url>
cd "Therapy processing"
```

#### 2️⃣ Set Up the Server

```bash
# Navigate to server directory
cd server

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env

# Edit .env file with your credentials
# Required variables:
# - OPENAI_API_KEY=your_openai_api_key
# - SUPABASE_URL=your_supabase_url
# - SUPABASE_KEY=your_supabase_anon_key
```

#### 3️⃣ Set Up Supabase Database

```bash
# Make sure you're in the server directory
# Run database migrations (creates tables and functions)
npx supabase db push

# This will create:
# - sessions table
# - pgvector extension for embeddings
# - semantic search function
# - necessary indexes
```

#### 4️⃣ Set Up the Client

```bash
# Navigate to client directory
cd ../client

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your API URL
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

#### 5️⃣ Start the Application

**Terminal 1 - Start the Server:**
```bash
cd server
pnpm start:dev
# Server will run on http://localhost:8080
```

**Terminal 2 - Start the Client:**
```bash
cd client
pnpm dev
# Client will run on http://localhost:3000
```

#### 6️⃣ Access the Application

Open your browser and go to `http://localhost:3000`

You're all set! 🎉

## 📖 How to Use

### Uploading a Session
1. Click **"Upload Session Recording"** on the home page
2. Drag & drop your audio file or click to browse
3. Supported formats: MP3, WAV, M4A, and more (max 50MB)
4. Click **"Upload and Process"**
5. Wait for AI to process (usually 30-60 seconds per minute of audio)
6. View your processed session in the **"AI Session Analysis"** page

### Viewing Analysis
- See AI-generated summaries, key topics, and sentiment
- Listen to the audio with the built-in player
- Read the full transcription with speaker labels
- Download audio files and transcriptions
- View vector embedding visualizations

### Searching Sessions
1. Go to **"AI Session Analysis"** page
2. Use the search bar at the top
3. Type natural language queries like:
   - "sessions about anxiety"
   - "coping strategies discussion"
   - "family relationship issues"
4. Get top 5 most relevant matches with similarity scores
5. Click **Clear** to see all sessions again

## 🤖 AI Models & Features

| Feature | Technology | Description |
|---------|-----------|-------------|
| Transcription | OpenAI Whisper-1 | Converts speech to text with high accuracy |
| Speaker Labeling | GPT-4o-mini | Identifies Therapist vs Client speakers |
| Summaries | GPT-4o-mini | Generates concise session overviews |
| Topic Extraction | GPT-4o-mini | Identifies key discussion themes |
| Sentiment Analysis | GPT-4o-mini | Detects emotional tone |
| Semantic Search | text-embedding-3-small | 1536-dimensional vector embeddings for intelligent search |

## 📁 Project Structure

```
├── client/                 # Next.js frontend application
│   ├── app/               # Next.js app directory
│   │   ├── page.tsx       # Upload page
│   │   └── processings/   # Analysis results page
│   ├── components/        # Reusable React components
│   │   ├── processings/   # Session analysis components
│   │   └── upload/        # File upload components
│   ├── services/          # API service layer
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
│
├── server/                # NestJS backend application
│   ├── src/
│   │   ├── modules/
│   │   │   ├── ai/        # OpenAI integration
│   │   │   ├── session/   # Session CRUD & search
│   │   │   └── supabase/  # Database connection
│   │   ├── utils/         # Helper functions
│   │   └── constants/     # Prompts and config
│   └── supabase/
│       └── migrations/    # Database migrations
│
└── README.md              # You are here!
```

## 🔧 Configuration

### Environment Variables

**Server (.env)**
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_key_here         # Required: Get from OpenAI
TRANSCRIPTION_MODEL=whisper-1        # Optional: Default shown
SUMMARY_MODEL=gpt-4o-mini            # Optional: Default shown
EMBEDDING_MODEL=text-embedding-3-small # Optional: Default shown

# Supabase Configuration
SUPABASE_URL=your_project_url        # Required: From Supabase dashboard
SUPABASE_KEY=your_anon_key           # Required: From Supabase dashboard

# Server Configuration
PORT=8080                            # Optional: Default 8080
```

**Client (.env.local)**
```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080  # Backend URL
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/session/upload` | Upload and process audio recording |
| GET | `/session` | Get all processed sessions |
| POST | `/session/search` | Semantic search across sessions |

## 🎨 UI Features

- **Emerald-Green Theme**: Modern gradient design with emerald and teal colors
- **Dark Mode Support**: Automatically detects system preference
- **AI Badges**: Clear indicators showing AI-generated content
- **Similarity Scores**: Percentage match for search results
- **Interactive Components**: Smooth animations and transitions
- **Responsive Layout**: Works on all screen sizes

## 🔒 Security & Privacy

- All audio files stored securely in Supabase storage
- Encrypted data transmission
- HIPAA-compliant infrastructure
- Unique filename generation prevents conflicts
- No audio data stored in OpenAI after processing

## 🐛 Troubleshooting

### Common Issues

**"No file uploaded" error:**
- Make sure file is under 50MB
- Check supported formats: mp3, wav, m4a

**Search returns no results:**
- Ensure sessions have been fully processed
- Try broader search terms
- Check that embeddings were generated during upload

**Database connection error:**
- Verify Supabase credentials in .env
- Check if migrations were run: `npx supabase db push`
- Ensure pgvector extension is enabled

**Port already in use:**
- Change PORT in server/.env
- Update NEXT_PUBLIC_API_BASE_URL in client/.env.local

## 📝 Development

### Building for Production

**Client:**
```bash
cd client
pnpm build
pnpm start
```

**Server:**
```bash
cd server
pnpm build
pnpm start:prod
```

## 💡 Tips for Best Results

- **Audio Quality**: Use clear recordings with minimal background noise
- **File Naming**: Use descriptive names for your audio files
- **Session Length**: Optimal processing for 15-60 minute sessions
- **Search Terms**: Use descriptive, natural language for better search results
- **Regular Backups**: Keep local copies of important sessions

## 🌟 Features Summary

- ✅ Automatic transcription with speaker labels
- ✅ AI-generated summaries and insights
- ✅ Sentiment analysis
- ✅ Key topics extraction
- ✅ Semantic search with vector similarity
- ✅ Audio duration detection
- ✅ Download capabilities
- ✅ Vector embedding visualization
- ✅ Secure encrypted storage

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Check environment variables are set correctly
3. Ensure all dependencies are installed

## 📄 License

Private - All rights reserved
