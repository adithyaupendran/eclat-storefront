# 🪞 ÉCLAT Storefront

![ÉCLAT Storefront](https://raw.githubusercontent.com/adithyaupendran/eclat-storefront/main/storefront/public/vercel.svg) 
*A highly curated, minimalist, and ultra-premium e-commerce experience.*

ÉCLAT is a conceptual high-end fashion storefront built to deliver an immersive, magazine-like shopping experience. It prioritizes stunning visual aesthetics, micro-interactions, and a seamless checkout journey, paired with a robust administrative backend.

---

## ✨ Features

- **Editorial Design System**: A bespoke monochromatic UI inspired by high-fashion magazines. Features fluid typography (Noto Serif & Inter) and subtle glassmorphism.
- **Dynamic Product Interactions**: Intelligent hover states, auto-scrolling image carousels, and dwell-time tracking.
- **Gemini-Powered AI Search**: Semantic search capabilities allowing users to find pieces using natural language and conceptual tags.
- **Full Admin Dashboard**: Comprehensive internal tooling for managing products, inventory, sizes, and editorial content.
- **Supabase Integration**: Secure authentication, real-time database management, and edge storage for product imagery.
- **Optimized Cart Experience**: Slide-out cart with real-time stock validation and smooth quantity controls.
- **Responsive Architecture**: Flawless layout transitions from mobile to ultra-wide desktop displays.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS Modules
- **Database & Auth**: [Supabase](https://supabase.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **AI & Search**: [Google Gemini API](https://deepmind.google/technologies/gemini/)
- **Validation**: [Zod](https://zod.dev/)
- **Deployment**: [Vercel](https://vercel.com)

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm installed. You will also need a Supabase project and a Gemini API key.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/adithyaupendran/eclat-storefront.git
   cd eclat-storefront/storefront
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the `storefront` directory and add the following:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Project Structure

```text
eclat-storefront/
├── storefront/
│   ├── src/
│   │   ├── actions/       # Server actions (cart, auth, admin)
│   │   ├── app/           # Next.js App Router pages & API routes
│   │   ├── components/    # Reusable UI components (eclat, admin, ui)
│   │   ├── context/       # React contexts (Behavior tracking)
│   │   ├── lib/           # Utility functions, Supabase clients, Mock data
│   │   └── store/         # Zustand global stores
│   ├── public/            # Static assets and placeholder images
│   └── supabase/          # Database schemas and migration scripts
```

## 🎨 Design Philosophy
ÉCLAT believes that e-commerce should feel less like a catalog and more like an exhibition. We use generous whitespace, constrained color palettes (`#f3f3f3` backgrounds), and deliberate typography choices to ensure the product imagery remains the absolute focal point.

---
*Built by [Adithya Upendran](https://github.com/adithyaupendran)*
