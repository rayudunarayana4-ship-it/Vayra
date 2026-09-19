# VAYRA FOOTWEAR

> STEP INTO YOUR STYLE.

A modern, high-performance luxury footwear e-commerce application engineered with React 19, Vite, and Tailwind CSS.

## Features

- **Customer Storefront**:
  - Luxury hero banner slider with smooth animations
  - Curated footwear categories: Sneakers, Loafers, Boots, Formal, Sandals/Slides
  - Interactive silhouette cards with stock status (In Stock, Low Stock, Sold Out)
  - Detailed product page with UK shoe sizing (`UK 6` – `UK 11`), specs, care instructions
  - Slide-out shopping bag drawer
  - Direct WhatsApp order placement (+91 7396811099)
  - Client-side branded A4 PDF invoice generator

- **Admin Management Portal** (`#admin`):
  - Live footwear inventory management
  - Footwear creation and editing (+ Add Footwear)
  - Hero banner slide manager
  - Customer order tracker with status workflow (Placed → Confirmed → Dispatched → Delivered)
  - Synchronized real-time single source of truth across browser tabs

## Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS v4
- **Icons & Animation**: Lucide React, Framer Motion
- **Invoicing**: jsPDF, jsPDF-AutoTable
- **State & Sync**: React Hooks, BroadcastChannel, LocalStorage
- **AI assistant**: FastAPI, Groq, and the local footwear knowledge base

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Footwear assistant

The VAYRA Assistant is embedded in the storefront. Its chat requests are proxied
from Vite's `/chat-api` path to the FastAPI service, keeping the Groq key out of
the browser bundle.

Add your key to `gemini-chatbot-master/.env` (this file is intentionally
ignored by Git):

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=qwen/qwen3.8-27b
```

Then start the API in a second terminal:

```bash
cd gemini-chatbot-master
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --reload --port 8000
```

Run `npm run dev` from the repository root and open the storefront. For a
production deployment, set `VITE_CHAT_API_URL` to the public HTTPS URL of this
API rather than `/chat-api`, and set `ALLOWED_ORIGINS` in the API environment
to the storefront origin.
