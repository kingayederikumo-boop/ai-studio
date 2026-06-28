# AI Studio

AI Studio is a modern AI workspace built with Next.js that provides a unified interface for interacting with NVIDIA large language models. It is designed for research, coding, problem solving, and general AI assistance through a fast, responsive web application.

---

## Features

- Modern Next.js App Router architecture
- Multi-model AI chat
- Streaming AI responses
- Responsive dark-themed interface
- Conversation history
- Supabase integration
- Progressive Web App (PWA) support
- Optimized for deployment on Vercel

---

## AI Models

AI Studio is currently configured with the following NVIDIA models:

| Model | Purpose |
|-------|---------|
| `nvidia/nemotron-3-ultra-550b-a55b` | High-quality reasoning and complex problem solving |
| `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning` | Fast reasoning and lightweight tasks |
| `qwen/qwen2.5-coder-32b-instruct` | Programming and code generation |
| `deepseek-ai/deepseek-v4-pro` | Advanced reasoning and analytical tasks |
| `moonshotai/kimi-k2.6` | Long-context conversations and general assistance |

---

## Technology Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 3

### Backend

- Next.js Route Handlers
- NVIDIA API
- LangChain
- Axios
- Supabase

### Deployment

- Vercel

---

## Getting Started

Clone the repository:

```bash
git clone https://github.com/kingayederikumo-boop/ai-studio.git
cd ai-studio
```

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
cp .env.local.example .env.local
```

Configure all required environment variables.

Start the development server:

```bash
npm run dev
```

---

## Environment Variables

Required variables include:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NVIDIA_API_KEY=

GITHUB_TOKEN=
```

Additional environment variables may be required depending on enabled features.

---

## Project Structure

```text
app/
components/
hooks/
lib/
public/
types/
```

---

## Deployment

Deploy AI Studio using Vercel.

1. Import the repository into Vercel.
2. Configure all required environment variables.
3. Deploy the application.
4. Verify AI model connectivity and application functionality.

---

## Roadmap

- Additional NVIDIA model support
- Expanded AI tools
- Improved conversation management
- Workspace enhancements
- Performance optimizations

---

## License

This project is maintained by the repository owner.