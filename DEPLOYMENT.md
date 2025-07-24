# Deploying to Vercel

This guide shows you how to deploy your expense tracking app to Vercel.

## Quick Deployment (Recommended)

### Steps:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy using the script**:
   ```bash
   ./deploy.sh
   ```

   Or manually:
   ```bash
   npm run build
   npx vercel --prod
   ```

3. **Configure Environment Variables** (in Vercel dashboard):
   - `OPENROUTER_API_KEY`: Your OpenRouter API key for AI features
   - `DATABASE_URL`: PostgreSQL connection string (optional for demo)

**Note**: Without `DATABASE_URL`, the app uses in-memory storage (data resets on server restart).

## Option 2: Full-Stack with Database (Production Ready)

For a production app with persistent data, you need to:

### 1. Set up a Database

Choose one of these database options:

**Neon Database (Recommended)**:
1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string

**Vercel Postgres**:
1. In your Vercel dashboard, go to Storage
2. Create a new Postgres database
3. Copy the connection string

### 2. Configure Environment Variables

In your Vercel project settings, add these environment variables:

```
DATABASE_URL=your-database-connection-string
OPENROUTER_API_KEY=your-openrouter-api-key
NODE_ENV=production
```

### 3. Update the App for Production

The app is already configured to use a database when `DATABASE_URL` is provided. No code changes needed!

### 4. Deploy

```bash
npx vercel --prod
```

## Environment Variables Needed

- `DATABASE_URL`: Your PostgreSQL connection string (optional for demo)
- `OPENROUTER_API_KEY`: For AI transaction import feature

## Vercel Configuration

The `vercel.json` file is already configured for you:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## Troubleshooting

**Build Errors**: Make sure all dependencies are installed:
```bash
npm install
```

**Database Connection**: Ensure your `DATABASE_URL` is correct and the database is accessible.

**API Key Issues**: Verify your `OPENROUTER_API_KEY` is valid and has sufficient credits.

## Alternative Deployment Platforms

This app can also be deployed to:
- **Netlify**: Use the same build settings
- **Railway**: Perfect for full-stack apps with databases
- **Render**: Good for both static and full-stack deployment

## Local Development

To test locally before deployment:
```bash
npm run dev
```

The app will run on `http://localhost:5000`