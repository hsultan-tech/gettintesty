# Nova Knowledge Assistant - Frontend

A React-based frontend for the Nova Knowledge Assistant chatbot that provides information about Scotia mutual funds, TFSA, and RRSP accounts.

## Features

- Interactive chat interface with the AI assistant
- Support for text responses and chart/image visualizations
- Clean, modern UI with responsive design
- Real-time message updates with loading states
- Built with React, TypeScript, and Vite

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **CSS** - Custom styling

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running (see backend repo)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set the backend API URL:

```
VITE_API_URL=http://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

### 5. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ChatInterface.tsx      # Main chat UI component
│   ├── ChatInterface.css      # Chat interface styles
│   ├── ChatMessage.tsx        # Individual message component
│   └── ChatMessage.css        # Message styles
├── services/
│   └── api.ts                 # API client for backend
├── types/
│   └── chat.ts                # TypeScript type definitions
├── App.tsx                    # Root component
├── App.css                    # App styles
├── index.css                  # Global styles
└── main.tsx                   # App entry point
```

## API Integration

The frontend expects the backend to provide the following endpoints:

### POST /chat
Send a message to the assistant.

**Request:**
```json
{
  "message": "What is the TFSA contribution limit?"
}
```

**Response:**
```json
{
  "reply": "The TFSA contribution limit for 2025 is...",
  "image_base64": "optional_base64_encoded_image",
  "agent_used": "tfsa"
}
```

### GET /health
Check backend health status.

**Response:**
```json
{
  "status": "healthy",
  "available_agents": ["fundfacts", "tfsa", "rrsp"]
}
```

## Deployment to Azure Web App

### Prerequisites
- Azure Web App created in Azure Portal
- Local Git deployment enabled in Azure Portal

### Deploy Using Local Git

1. **Configure environment variables for production:**
   
   Edit `.env` and set the backend API URL:
   ```
   VITE_API_URL=https://the-backend.azurewebsites.net
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Add Azure remote:**
   
   Get the Git URL from Azure Portal → Deployment Center, then:
   ```bash
   git remote add azure https://<deployment-username>@<app-name>.scm.azurewebsites.net/<app-name>.git
   ```

4. **Commit and push to Azure:**
   ```bash
   git add .
   git commit -m "Deploy to Azure"
   git push azure main
   ```

5. **Verify deployment:**
   
   Visit Azure Web App URL: `https://<app-name>.azurewebsites.net`

### Azure Portal Configuration

1. **Set environment variables** (Azure Portal → Configuration → Application settings):
   - Add `VITE_API_URL` with the backend API URL
   
2. **Configure build settings** (if needed):
   - Build command: `npm run build`
   - Output directory: `dist`

## Environment Variables

The app uses environment variables that are read at **build time**:

- `VITE_API_URL` - Backend API URL
  - **Local development**: `http://localhost:8000` (set in `.env`)
  - **Production**: Set to the deployed backend URL before building
  
**Important:** Environment variables prefixed with `VITE_` are embedded during build. Update `.env` before running `npm run build` for production.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

Internal use only - Scotia Bank
