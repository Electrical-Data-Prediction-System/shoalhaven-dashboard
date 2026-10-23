# Hydrochart

## Preliminaries

Make sure you are running shoalhaven-api first 
```
uv sync                                         # install packages, only need to do once
uv run shoalhaven serve                         # runs the local api server
```

## Configuring Environment Variables

First create a .env file in the root directory
```
API_INTERNAL_URL="http://0.0.0.0:8000"          # specify local api server for development and local deployment 
NEXT_PUBLIC_API_URL="http://0.0.0.0:8000"       # specify server api url for production and server deployment 

NEXT_PUBLIC_DATABASE_ID="demo"                  # specify which charts get rendered and saved from localstorage based on database
                                                # "demo" for the demo database and "hydrochart" for production database
                                                # doesn't change your level of access, just saved and rendered charts
```

## Running The Dashboard

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
# or if on older machine
npx next dev --webpack
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.