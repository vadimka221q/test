# UX Review App

AI-powered UI/UX design review tool using Claude Vision API. Upload Figma screenshots and get professional, actionable design feedback.

## Features

- Upload 1-10 design screenshots (PNG, JPG, GIF, WebP)
- Provide product context (type, users, goals, platform)
- Get structured UX review with:
  - Context understanding
  - Critical UX issues
  - Visual hierarchy problems
  - Accessibility risks
  - Conversion/product risks
  - Actionable recommendations
  - Priority summary
- Export report as PDF
- Clean, professional UI
- No data persistence (privacy-focused)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** Claude 3.5 Sonnet (Vision)
- **PDF Export:** html2pdf.js

## Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key ([Get one here](https://console.anthropic.com/))

## Local Development

### 1. Clone and install

```bash
cd ux-review-app
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production

```bash
npm run build
npm start
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com) and import your repository

3. Add environment variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: Your Anthropic API key

4. Deploy

Or use Vercel CLI:

```bash
npm i -g vercel
vercel
```

### Deploy to Other Platforms

#### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway add
railway variables set ANTHROPIC_API_KEY=your_key
railway up
```

#### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t ux-review-app .
docker run -p 3000:3000 -e ANTHROPIC_API_KEY=your_key ux-review-app
```

## Project Structure

```
ux-review-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── review/
│   │   │       └── route.ts      # API endpoint for Claude
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Main page
│   ├── components/
│   │   ├── ContextForm.tsx       # Product context form
│   │   ├── ImageUpload.tsx       # Image upload with preview
│   │   ├── LoadingSpinner.tsx    # Loading state
│   │   └── ReviewReport.tsx      # Report display + PDF export
│   └── lib/
│       ├── claude.ts             # Claude API integration
│       └── prompts.ts            # System prompt configuration
├── .env.example
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## API Endpoint

### POST `/api/review`

Request body:

```json
{
  "images": [
    {
      "base64": "base64-encoded-image-data",
      "mediaType": "image/png"
    }
  ],
  "context": {
    "productType": "SaaS dashboard",
    "targetUsers": "Small business owners",
    "primaryGoal": "User onboarding",
    "platform": "Web (Desktop)",
    "constraints": "Limited dev resources"
  }
}
```

Response:

```json
{
  "review": "## Context Understanding\n..."
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |

## Customization

### Modify the Review Prompt

Edit `src/lib/prompts.ts` to customize:
- `SYSTEM_PROMPT`: The reviewer's persona and rules
- `OUTPUT_FORMAT`: The structure of the review

### Adjust API Settings

Edit `src/lib/claude.ts`:
- Change the model (e.g., `claude-3-opus-20240229`)
- Adjust `max_tokens` for longer/shorter reviews

### Style Changes

Edit `tailwind.config.js` and `src/app/globals.css` for:
- Color scheme
- Typography
- Spacing

## Troubleshooting

### "ANTHROPIC_API_KEY is not configured"
Make sure your `.env` file exists and contains a valid API key.

### "Rate limit exceeded"
You've hit Anthropic's rate limits. Wait a moment and try again.

### Large images timeout
Reduce image size or resolution before uploading. The API has a 60-second timeout.

### PDF export fails
Make sure JavaScript is enabled. The PDF is generated client-side.

## License

MIT
