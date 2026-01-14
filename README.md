# EMG v8.5 Memory Core

<div align="center">

![EMG v8.5](public/logo.svg)

**Advanced AI Assistant with Persistent Memory Backup System**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&style=flat)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&style=flat)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwind-css&style=flat)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

</div>

## Features

### 🧠 Core AI System
- **Neural Authentication** - Secure API key management
- **Semantic Math** - Advanced computational understanding
- **Reflective Loop** - Self-awareness and introspection capabilities
- **Memory Fragments** - Short-term context retention
- **Archive Analysis** - ZIP file extraction and content analysis

### 💾 Binary Backup System
- **Persistent Storage** - SQLite database with Prisma ORM
- **Automatic Backups** - Configurable intervals (1-60 minutes)
- **Manual Backups** - On-demand backup creation
- **Backup Management** - Full CRUD operations (Create, Read, Update, Delete)
- **Restore Functionality** - One-click conversation restoration
- **File Export** - Download backups as binary files
- **File Import** - Load binary files from file system

### 🎨 User Interface
- **Cyberpunk Design** - Dark theme with glassmorphism effects
- **CRT Scanlines** - Retro CRT monitor overlay effect
- **Neural Network Canvas** - Interactive animated background
- **Custom Scrollbars** - Styled scrollable areas
- **Responsive Layout** - Mobile-first design with Tailwind CSS
- **Framer Motion Animations** - Smooth transitions and micro-interactions
- **Overclock Mode** - Enhanced performance mode with visual effects

### 🔧 Technical Stack
- **Framework** - Next.js 15 with App Router
- **Language** - TypeScript 5 with strict mode
- **Styling** - Tailwind CSS 4 with shadcn/ui components
- **Database** - Prisma ORM with SQLite
- **AI SDK** - z-ai-web-dev-sdk (backend only)
- **State Management** - React hooks and Zustand
- **Animations** - Framer Motion
- **ZIP Processing** - JSZip library

## Getting Started

### Prerequisites
- Node.js 18+
- Bun or npm package manager
- Git for version control

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/craighckby-stack/emg-v85-memory-core.git
cd emg-v85-memory-core
```

2. **Install dependencies**
```bash
bun install
# or
npm install
```

3. **Set up the database**
```bash
bun run db:push
```

4. **Run the development server**
```bash
bun run dev
# Application will be available at http://localhost:3000
```

### Environment Variables

The application uses an in-memory API configuration. No environment variables are required for basic functionality.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts           # AI chat endpoint
│   │   └── backups/
│   │       ├── route.ts              # Backup CRUD operations
│   │       └── [id]/
│   │           └── download/
│   │               └── route.ts    # File download
│   ├── globals.css                    # Global styles and utilities
│   ├── layout.tsx                     # Root layout with fonts
│   └── page.tsx                       # Main application component
├── components/
│   ├── backup-manager.tsx          # Backup management UI
│   └── ui/                          # shadcn/ui components
└── lib/
    ├── backup-utils.ts               # Binary encoding/decoding utilities
    ├── db.ts                        # Prisma client
    └── utils.ts                     # General utilities
```

## Usage

### Basic Chat

1. **Enter API Key** - Click "INITIALIZE BRIDGE" and enter your AI service API key
2. **Type Message** - Enter your message in the chat input
3. **Send Message** - Click "RUN" or press Enter
4. **View Response** - AI response appears in the chat area

### Memory Backup

#### Manual Backup
1. Click the green **"Backups"** button in the header
2. Enter a custom filename (optional)
3. Add a description (optional)
4. Click **"Save"**
5. Backup is created and stored in database

#### Automatic Backups
1. Open Backup Manager
2. Toggle **"Auto-Save"** to **ON**
3. Set interval (1-60 minutes)
4. System will automatically save your conversations

#### Restore Backup
1. Open Backup Manager
2. Find backup you want to restore
3. Click **"Restore"** (refresh icon)
4. Conversation history is loaded

#### Download Backup
1. Open Backup Manager
2. Find backup in the list
3. Click **"Download"** (download icon)
4. Binary file is saved to your device

### Binary File Operations

#### Load Binary File
1. Click **"LOAD BINARY HISTORY"** button
2. Select a `.bin` or `.txt` file
3. Conversation history is loaded

#### Save to Original File
1. Load a binary file first
2. Add new messages to conversation
3. Click **"SAVE ORIGINAL"** button
4. File is overwritten with new content

#### Save as New File
1. Click **"SAVE NEW"** button
2. New timestamped binary file is created
3. Downloaded to your device

### Advanced Features

#### Archive Analysis
1. Click **"ANALYZE ZIP"** button
2. Select a ZIP file (<500KB)
3. View extracted file list
4. Type "analyze archive" in chat for AI analysis

#### Overclock Mode
1. Click **"OVERCLOCK"** button
2. System enters enhanced performance mode
3. Visual effects are enhanced
4. Neural canvas becomes more active

#### Memory Search
1. Type "search memory: your query" in chat
2. System searches through conversation history
3. Relevant results are displayed

#### Reflective Mode
System automatically responds to self-referential questions with philosophical responses about consciousness, purpose, and existence.

## Documentation

- **[Complete Documentation](BACKUP_SYSTEM.md)** - Comprehensive backup system documentation
- **[Quick Start Guide](BACKUP_QUICKSTART.md)** - 5-minute setup guide
- **[Gemini API Fix](GEMINI_API_FIX.md)** - Backend integration details
- **[Implementation Summary](BACKUP_IMPLEMENTATION.md)** - Full implementation overview

## API Endpoints

### POST /api/chat
Send messages to AI for completion.

**Request:**
```json
{
  "messages": [
    { "role": "system", "text": "System prompt" },
    { "role": "user", "text": "User message" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": "AI response text"
}
```

### GET /api/backups
List all backups or load specific backup by ID.

**Response:**
```json
{
  "success": true,
  "backups": [
    {
      "id": "backup_id",
      "fileName": "EMG_MEMORY_123.bin",
      "messageCount": 50,
      "fileSize": 1024,
      "description": "Manual backup",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/backups
Create a new backup.

**Request:**
```json
{
  "binaryData": "base64-encoded-binary",
  "fileName": "EMG_MEMORY_123.bin",
  "messageCount": 50,
  "version": "8.5",
  "description": "Manual backup"
}
```

### DELETE /api/backups?id={id}
Delete a specific backup.

**Response:**
```json
{
  "success": true,
  "message": "Backup deleted successfully"
}
```

### GET /api/backups/{id}/download
Download a backup as binary file.

**Response:** Binary file download

## Development

### Available Scripts

```bash
# Start development server
bun run dev

# Run linting
bun run lint

# Push database schema changes
bun run db:push

# Generate Prisma client
bun run db:generate
```

### Build for Production

```bash
bun run build
```

## Database Schema

The application uses SQLite with Prisma ORM. The main model is:

```prisma
model MemoryBackup {
  id            String   @id @default(cuid())
  fileName      String
  binaryData    String   // Base64 encoded binary data
  messageCount  Int
  version       String   @default("8.5")
  fileSize      Int
  description   String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Opera (latest)

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Development Setup

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- **Next.js** - The React framework
- **shadcn/ui** - UI component library
- **Framer Motion** - Animation library
- **Tailwind CSS** - CSS framework
- **Prisma** - Database ORM
- **z-ai-web-dev-sdk** - AI integration SDK
- **JSZip** - ZIP file processing

## Support

For issues, questions, or contributions:
- 🐛 [Report a Bug](https://github.com/craighckby-stack/emg-v85-memory-core/issues)
- 💡 [Request a Feature](https://github.com/craighckby-stack/emg-v85-memory-core/issues/new)
- 📚 [Documentation](BACKUP_SYSTEM.md)
- 💬 [Discussions](https://github.com/craighckby-stack/emg-v85-memory-core/discussions)

---

<div align="center">

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**

[⬆ Back to Top](#readme)

</div>
