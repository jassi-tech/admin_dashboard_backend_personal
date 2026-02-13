# Backend Environment Variables (.env)

These variables are required for the backend API to function correctly.

```bash
PORT=5000
JWT_SECRET=your_jwt_secret_here

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="your-client-email@your-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"

# Note: Using bcryptjs for compatibility with Vercel serverless functions.
```
