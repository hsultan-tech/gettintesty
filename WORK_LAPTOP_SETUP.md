# Work Laptop Setup Guide

Complete step-by-step instructions to run Scotia Curiosity on your work laptop.

## Prerequisites

- Git installed
- Python 3.8+ installed
- Node.js 18+ (or nvm)
- OpenAI API key

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/hsultan-tech/gettintesty.git
cd gettintesty
```

---

## Step 2: Create `.env` File

Create a `.env` file in the project root with your OpenAI API key:

```bash
cat > .env << 'EOF'
# Required: Your OpenAI API key
OPENAI_API_KEY=sk-your-actual-key-here

# Optional: Leave empty to disable authentication
APP_PIN=

# Optional: Model configuration
OPENAI_MODEL=gpt-4o
USE_AZURE=false
EOF
```

**Important:** Replace `sk-your-actual-key-here` with your real OpenAI API key.

---

## Step 3: Backend Setup

### Install Python Dependencies

```bash
# Install dependencies
pip install -r requirements.txt

# If you get SSL certificate errors on corporate network:
pip install -r requirements.txt --trusted-host pypi.org --trusted-host files.pythonhosted.org
```

### Start the Backend Server

```bash
# Start with uvicorn (recommended)
uvicorn main:app --reload --port 8000

# Or run directly
python main.py
```

**Expected output:**
```
✅ FundFacts agent loaded
✅ TFSA agent loaded
INFO:     Uvicorn running on http://127.0.0.1:8000
```

Keep this terminal running. The backend is now live at `http://localhost:8000`

---

## Step 4: Frontend Setup (New Terminal)

### Navigate to Frontend Directory

```bash
cd front-2
```

### Install Node.js (if using nvm)

```bash
# Install Node 20
nvm install

# Use Node 20
nvm use
```

### Install Dependencies

**If you encounter SSL certificate errors:**

```bash
# Run the fix script
chmod +x fix-npm.sh
./fix-npm.sh
```

**Or manually:**

```bash
# Configure npm for corporate network
npm config set strict-ssl false

# Clean install from lock file (ensures exact same versions)
rm -rf node_modules
npm ci --legacy-peer-deps
```

### Start the Frontend Dev Server

```bash
npm run dev
```

**Expected output:**
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Step 5: Access the Application

Open your browser and go to:

**http://localhost:5173**

You should see the Scotia Curiosity chat interface immediately (no PIN required).

---

## Troubleshooting

### Issue: "Chat API not working"

**Cause:** Backend server not running

**Solution:**
1. Check backend is running on port 8000
2. Visit `http://localhost:8000/health` - should return JSON
3. Check terminal for errors

### Issue: "UNABLE_TO_GET_ISSUER_CERT_LOCALLY"

**Cause:** Corporate SSL certificates

**Solution:**
```bash
npm config set strict-ssl false
npm ci --legacy-peer-deps
```

### Issue: "npm install fails with exit handler error"

**Cause:** Corrupted npm cache or React 19 peer dependencies

**Solution:**
```bash
cd front-2
./fix-npm.sh
# This runs npm ci with legacy-peer-deps and disables strict SSL
```

### Issue: "nvm: command not found"

**Cause:** nvm not installed

**Solution:**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, then:
nvm install 20
nvm use 20
```

Or install Node.js directly from https://nodejs.org

### Issue: "Port 8000 already in use"

**Cause:** Another process using port 8000

**Solution:**
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9

# Or use a different port
uvicorn main:app --reload --port 8001

# Then update frontend .env:
echo "VITE_API_URL=http://localhost:8001" > front-2/.env
```

### Issue: "Module not found" errors in Python

**Cause:** Missing dependencies

**Solution:**
```bash
pip install -r requirements.txt --upgrade
```

---

## Production Build (Optional)

To build and run the production version:

```bash
# Build frontend
cd front-2
npm run build

# Start backend (serves built frontend)
cd ..
uvicorn main:app --host 0.0.0.0 --port 8000
```

Visit `http://localhost:8000` to use the production build.

---

## Architecture

- **Frontend:** React + TypeScript + Vite (port 5173 in dev)
- **Backend:** FastAPI + Python (port 8000)
- **API:** OpenAI GPT-4o
- **Agents:** iTrade, FundFacts, TFSA

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `uvicorn main:app --reload --port 8000` | Start backend |
| `npm run dev` | Start frontend (in front-2/) |
| `./fix-npm.sh` | Fix npm install issues |
| `http://localhost:5173` | Frontend URL |
| `http://localhost:8000` | Backend URL |
| `http://localhost:8000/health` | Health check |

---

## Need Help?

1. Check both terminal windows for error messages
2. Verify `.env` file has valid `OPENAI_API_KEY`
3. Ensure both backend (8000) and frontend (5173) are running
4. Check browser console (F12) for errors
5. Try the troubleshooting steps above

---

**You're all set! The app should now be running on your work laptop.** 🚀
