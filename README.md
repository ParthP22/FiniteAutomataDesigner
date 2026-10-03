# Finite Automata Designer

A web app that explores Theory of Computation concepts such as Deterministic and Nondeterministic Finite Automata (DFAs and NFAs). DFAs and NFAs are mathematical models of computation that recognize patterns and process languages. 

 - The application supports:
   - User authentication
   - Users can save and load their designs

 - The application uses an interactive HTML5 Canvas editor supporting:
   - Real-time rendering
   - Transition drawing
   - Custom hit-detection
   - Self-managed scene graph
   - Drag-and-drop state creation

 - Both DFAs and NFAs support:
   - Custom user alphabets'
   - Mathematical symbols supported, such as $\alpha$, $\beta$, $\Sigma$, $\pi$, $\mu$ etc. using LaTeX symbols
   - Simulate state transitions and validate input strings against user-built automata, returning acceptance and rejection results
   - Transition arrow symbols validated against the existing alphabet, preventing symbols that don't exist outside the alphabet from being used

## Local Development

This project uses [Supabase](https://supabase.com) for its database and authentication. For local development, you run a fully local copy of Supabase (Postgres, Auth, Storage, etc.) via Docker — no access to the production Supabase project is required.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Node.js 20 or later
- If you're on Windows, we recommend developing inside [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) rather than natively. Make sure:
  - Docker Desktop has WSL2 integration enabled for your distro (Settings → Resources → WSL Integration)
  - Node.js is installed **inside** your WSL2 distro (e.g. via [nvm](https://github.com/nvm-sh/nvm)), not just on Windows — otherwise commands like `npx` will silently run the Windows binaries and fail on WSL paths
  - Your project files live inside the Linux filesystem (e.g. `~/projects/...`), not under `/mnt/c/...`

### Setup

1. **Clone the repo and install dependencies**

   ```bash
   git clone https://github.com/Collyz/FiniteAutomataDesigner
   cd FiniteAutomataDesigner/finite-automata-designer
   npm install
   ```

   The Supabase CLI is installed as a project dependency (not globally), so it's run via `npx supabase ...` throughout these steps.

2. **Start the local Supabase stack**

   Make sure Docker Desktop is running, then:

   ```bash
   npx supabase start
   ```

   The first run pulls several Docker images and can take a few minutes. When it finishes, it prints a block of local URLs and keys — you'll need these in the next step.

   This also applies the project's committed database schema (`supabase/migrations/`) and seed data (`supabase/seed.sql`) automatically, so your local database ends up matching production's schema without needing any access to the real project.

3. **Set up environment variables**

   ```bash
   cp .env.template .env.local
   ```

   Fill in `.env.local` using the values printed by `npx supabase start` (you can reprint them anytime with `npx supabase status`). See the comments in `.env.template` for exactly which value maps to which variable.

4. **Run the app**

   ```bash
   npm run dev:all
   ```

5. **Log in**

   A test account is created automatically from the seed data:

   - **Email:** `demo@example.com`
   - **Password:** `password123`

   > **Note:** Google Sign-In is not available in local development, since it requires OAuth credentials tied to a specific redirect URL. Use the email/password login above instead. If you sign up a new account locally and your app requires email confirmation, check [Mailpit](http://127.0.0.1:54324) (the local email inbox printed in the `supabase start` output) for the confirmation link — local Auth doesn't send real emails.

### Useful commands

| Command | Description |
|---|---|
| `npx supabase status` | Reprint local API URLs and keys |
| `npx supabase db reset` | Rebuild the local database from migrations + seed data (useful if your local DB gets into a bad state) |
| `npx supabase stop` | Stop all local Supabase Docker containers |

### Making schema changes

If you need to change the database schema, create a new migration rather than editing the database directly:

```bash
npx supabase migration new <short_description>
```

Add your SQL to the generated file in `supabase/migrations/`, then run `npx supabase db reset` to apply it locally. Commit the migration file along with your changes so it's applied for other contributors and, eventually, production.
