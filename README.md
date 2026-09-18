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

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
