# BioBuddy Concept Map Generator

A Next.js 14 application that helps medical and biology students transform their lecture notes into visual concept maps using AI.

## 🚀 Features (Planned)

- **Smart Text Analysis**: Advanced AI analyzes your notes to identify key concepts and their relationships
- **Visual Concept Maps**: Generate beautiful, interactive concept maps for complex biological relationships
- **Enhanced Learning**: Improve understanding and retention through visual learning

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Fonts**: Geist Sans & Geist Mono
- **UI Components**: Custom components with Tailwind CSS

## 📁 Project Structure

```
biobuddy/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Landing page
│   │   └── globals.css      # Global styles
│   ├── components/          # Reusable React components
│   │   └── ui/              # UI component library
│   ├── lib/                 # Utility functions and configurations
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Helper functions
├── public/                  # Static assets
├── env.template            # Environment variables template
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.template .env.local
   ```
   Edit `.env.local` and add your API keys when ready.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📝 Environment Variables

Copy `env.template` to `.env.local` and configure:

- `OPENAI_API_KEY` - OpenAI API key for text analysis
- `ANTHROPIC_API_KEY` - Anthropic API key (alternative)
- `DATABASE_URL` - Database connection string
- `NEXT_PUBLIC_APP_URL` - Application URL

## 🎯 Current Status

This is the initial setup phase. The landing page is complete with:
- ✅ Professional hero section
- ✅ Feature preview cards
- ✅ Responsive design with Tailwind CSS
- ✅ TypeScript setup
- ✅ Project structure for future features

**Next Steps**: Text input interface, AI integration, and concept mapping functionality.

## 📄 License

This project is under development.