# Ralph PRD Generator

A conversational AI tool that guides you through creating well-structured Product Requirements Documents (PRDs). Built with Next.js and powered by Claude AI.

## ⚠️ Important: Node.js Version Requirement

**This project requires Node.js 18.17.0 or higher.** The current system has Node.js 14.15.4, which is not compatible.

To use this project, you need to upgrade Node.js:
- **Recommended**: Use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions
- After installing nvm, run: `nvm install 18.17.0 && nvm use 18.17.0`
- Or download Node.js 18+ from [nodejs.org](https://nodejs.org/)

## What It Does

Ralph PRD Generator helps teams define features with clarity before development begins. Through a guided conversation, it:

- Elicits value and problem statements
- Defines scope and boundaries
- Generates well-sliced user stories (2-4 hours each)
- Outputs PRDs in both Markdown and JSON formats

The JSON format is compatible with [Ralph](https://github.com/snarktank/ralph), the autonomous AI agent loop.

## Key Features

- **Conversational Interface**: Natural chat-based PRD creation
- **Three-Phase Process**: Value → Scope → Stories
- **Park & Resume**: Save partial PRDs and continue later
- **Dual Output**: Markdown for humans, JSON for Ralph
- **No Authentication**: Start immediately, no signup required
- **Mobile Responsive**: Works on any device

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Claude API (Anthropic SDK)
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key ([get one here](https://console.anthropic.com/))

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ralph-prd-generator.git
cd ralph-prd-generator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your_api_key_here
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a New PRD

1. Click "Start New PRD" on the landing page
2. Answer Claude's questions about your feature
3. Progress through three phases:
   - **Phase 1: Value & Problem** - What and why
   - **Phase 2: Scope & Boundaries** - What's in and out
   - **Phase 3: User Stories** - How it gets built
4. Review and download your PRD

### Park & Resume

If you need to pause:

1. Click "Park It" in the chat interface
2. Claude will output your current progress
3. Download the partial PRD
4. Later, click "Continue Parked PRD" and upload your file

### Output Formats

**Markdown** - Human-readable format with:
- Problem statement
- Success metrics
- Scope (in/out)
- User stories with acceptance criteria
- Technical notes
- Open questions

**JSON (Ralph-compatible)** - Machine-readable format with:
- Project name
- Branch name
- User stories with priorities
- Pass/fail tracking for Ralph

## Project Structure

```
ralph-prd-generator/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── chat/
│   │   └── page.tsx          # Chat interface
│   ├── output/
│   │   └── page.tsx          # PRD output view
│   └── api/
│       └── chat/
│           └── route.ts      # Claude API handler
├── components/
│   ├── ChatMessage.tsx       # Chat bubble component
│   ├── ChatInput.tsx         # Message input
│   ├── ProgressIndicator.tsx # Phase tracker
│   ├── MarkdownPreview.tsx   # Markdown renderer
│   └── OutputTabs.tsx        # Output tab switcher
├── lib/
│   ├── types.ts              # TypeScript types
│   ├── prompts.ts            # System prompts
│   ├── claude.ts             # API client
│   └── utils.ts              # Helper functions
└── skills/
    └── prd-generator/
        └── SKILL.md          # Claude-Code skill
```

## Claude-Code Skill

This project includes a `/prd` skill for developers using [Claude-Code](https://claude.com/claude-code).

To use it:

```bash
# In Claude-Code
/prd
```

The skill will guide you through creating a PRD directly in your development environment, saved to `tasks/prd-[feature-name].md`.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add `ANTHROPIC_API_KEY` to environment variables
4. Deploy

### Other Platforms

The app works on any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with `npm run build && npm start`

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |

### SEO

The app includes `noindex, nofollow` meta tags to prevent search engine indexing. This is intentional for internal tools.

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Best Practices

### For Users

- **One feature per session**: Don't try to define multiple features at once
- **Be specific**: "Users" is too vague. "Sales managers" is better.
- **Push back on scope creep**: If it feels too big, it probably is
- **Use Park It liberally**: It's better to pause and think than rush through

### For Developers

- Keep user stories small (2-4 hours max)
- Slice vertically (end-to-end value), not horizontally (technical layers)
- Write acceptance criteria that are testable
- Include "Typecheck passes" as a criterion for all stories

## Troubleshooting

### Claude API Errors

**Problem**: "ANTHROPIC_API_KEY is not set"
**Solution**: Ensure `.env.local` exists with your API key

**Problem**: Rate limit errors
**Solution**: Wait a moment and retry, or upgrade your Anthropic plan

### Build Errors

**Problem**: TypeScript errors
**Solution**: Run `npm install` to ensure all types are installed

**Problem**: Module not found
**Solution**: Check import paths use `@/` for absolute imports

### Runtime Issues

**Problem**: Page not found after clicking "Start New PRD"
**Solution**: Ensure `app/chat/page.tsx` exists

**Problem**: PRD not displaying on output page
**Solution**: Check browser console for errors, ensure session storage is enabled

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Claude](https://anthropic.com/)
- Designed for [Ralph](https://github.com/snarktank/ralph)

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section above

---

**Built with Claude Code** - An AI-powered development tool by Anthropic
