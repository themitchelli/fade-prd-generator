# FADE PRD Generator

A conversational AI tool that guides you through creating well-structured Product Requirements Documents (PRDs). Built with Next.js and powered by Claude AI.

## What It Does

FADE PRD Generator helps teams define features with clarity before development begins. Through a guided conversation, it:

- Elicits value and problem statements
- Defines scope and boundaries
- Generates well-sliced user stories (2-4 hours each)
- Outputs PRDs in both Markdown and JSON formats

The JSON format is compatible with [FADE](https://github.com/themitchelli/fade), the Framework for Agentic Development and Engineering.

## Key Features

- **Conversational Interface**: Natural chat-based PRD creation
- **Multiple Work Types**: Features, Enhancements, Spikes, Tech Debt, Bug Reports
- **Interview Modes**: Standard (thorough) or Quick (streamlined)
- **Park & Resume**: Save partial PRDs and continue later
- **Dual Output**: Markdown for humans, JSON for FADE
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
git clone https://github.com/themitchelli/fade-prd-generator.git
cd fade-prd-generator
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

### Work Types

Choose the type that best matches your work:

| Type | Use Case | Output |
|------|----------|--------|
| **New Project** | Greenfield codebase | Feature PRD |
| **New Feature** | Adding capability to existing system | Feature PRD |
| **Enhancement** | Improving existing functionality | Enhancement PRD |
| **Spike** | Time-boxed research/exploration | Spike Brief |
| **Tech Debt** | Refactoring, migrations, upgrades | Tech Debt Brief |
| **Bug Report** | Documenting bugs with reproduction steps | Bug Report |

### Interview Modes

For Feature-type work, choose your interview depth:

- **Standard Mode**: More thorough, explores edge cases
- **Quick Mode**: Faster, assumes you know what you want

### Park & Resume

If you need to pause:

1. Click "Home" in the navigation bar
2. Choose "Park & Download" to save your session
3. A JSON file downloads with your progress
4. Later, click "Continue Parked Session" and upload your file

## Output Formats

### Markdown

Human-readable format with:
- Problem statement
- Success metrics
- Scope (in/out)
- User stories with acceptance criteria
- Technical notes
- Open questions

### JSON (FADE-compatible)

Machine-readable format for use with the FADE framework.

#### Filename Convention

Downloaded JSON files follow this naming convention:

```
{TYPE}-XXX-{slug}.json
```

| Component | Description | Examples |
|-----------|-------------|----------|
| `TYPE` | Work type prefix (uppercase) | FEAT, ENH, SPIKE, CHORE, BUG |
| `XXX` | Placeholder for your number | Replace with 001, 042, etc. |
| `slug` | Kebab-case feature name | user-authentication, api-caching |

Examples:
- `FEAT-XXX-user-authentication.json`
- `ENH-XXX-dashboard-performance.json`
- `SPIKE-XXX-evaluate-auth-libraries.json`
- `CHORE-XXX-upgrade-react-18.json`
- `BUG-XXX-login-timeout-error.json`

#### JSON Structure

Feature PRDs follow this structure:

```json
{
  "type": "feature",
  "project": "Project Name",
  "branchName": "feature/feature-name",
  "featureName": "Feature Name",
  "description": "Brief description",
  "problemStatement": "Problem being solved",
  "successMetrics": ["Metric 1", "Metric 2"],
  "inScope": ["Item 1", "Item 2"],
  "outOfScope": ["Item 1", "Item 2"],
  "userStories": [
    {
      "id": "US-001",
      "title": "Story title",
      "description": "As a [role], I want [capability] so that [benefit]",
      "acceptanceCriteria": ["Criterion 1", "Criterion 2"],
      "priority": 1,
      "passes": false,
      "notes": ""
    }
  ],
  "technicalNotes": "Optional technical context",
  "openQuestions": ["Question 1"],
  "contextDocs": ["url1", "url2"]
}
```

**Important notes:**
- `passes` must be boolean `false`, not string `"false"`
- `type` values: `"feature"`, `"enhancement"`, `"spike"`, `"chore"`, `"bug"`
- Stories are ordered by `priority` (1 = highest)

## Project Structure

```
fade-prd-generator/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── chat/
│   │   └── page.tsx          # Chat interface
│   ├── mode/
│   │   └── page.tsx          # Interview mode selection
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
│   ├── OutputTabs.tsx        # Output tab switcher
│   ├── Navbar.tsx            # Navigation bar
│   └── HelpModal.tsx         # In-app help
└── lib/
    ├── types.ts              # TypeScript types
    ├── prompts.ts            # System prompts
    ├── claude.ts             # API client
    └── utils.ts              # Helper functions
```

## Live Demo

**https://prd-generator.ddns.net**

Hosted on Raspberry Pi 5 with Caddy reverse proxy and automatic HTTPS.

## Deployment

### Docker (Recommended for Self-Hosting)

The project includes Docker support optimized for ARM64 (Raspberry Pi) and x86_64.

```bash
# Clone and configure
git clone https://github.com/themitchelli/fade-prd-generator.git
cd fade-prd-generator
echo "ANTHROPIC_API_KEY=your-key-here" > .env

# Build and run
docker compose up -d --build

# Access at http://localhost:3001
```

See `deploy/README.md` for full deployment instructions including Caddy reverse proxy setup.

### Vercel

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
- Include stack-appropriate validation as a criterion

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

**Problem**: Page not found after selecting work type
**Solution**: Ensure `app/chat/page.tsx` exists

**Problem**: PRD not displaying on output page
**Solution**: Check browser console for errors, ensure session storage is enabled

## Related Projects

- [FADE](https://github.com/themitchelli/fade) - Framework for Agentic Development and Engineering

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section above

---

**Built with Claude Code** - An AI-powered development tool by Anthropic
