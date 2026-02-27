#!/bin/bash

# Vercel Environment Variable Upload Script
# Run this from the backend directory after logging in with 'vercel login'

echo "Starting environment variable upload to Vercel..."

# List of variables to upload
vars=(
  "MONGO_URI"
  "JWT_SECRET"
  "GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET"
  "GEMINI_API_KEY"
  "SES_HOST"
  "SES_PORT"
  "SES_SMTP_USER"
  "SES_SMTP_PASS"
  "FROM_EMAIL"
)

# Values from .env (parsing simple KEY=VALUE format)
for var in "${vars[@]}"; do
  value=$(grep "^$var=" .env | cut -d'=' -f2-)
  if [ -n "$value" ]; then
    echo "Uploading $var..."
    printf "%s" "$value" | vercel env add "$var" production
  else
    echo "Warning: $var not found in .env"
  fi
done

echo "Done! You can now deploy with 'vercel --prod'"