# CoBuilder Deployment Guide

This guide will help you deploy CoBuilder to Render, a cloud platform that offers free hosting for web applications.

## Prerequisites

- A Render account (free)
- A MongoDB database (MongoDB Atlas free tier recommended)
- A Google AI API key (for AI features)

## Step 1: Prepare Your Database

1. **Set up MongoDB Atlas (Recommended)**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account
   - Create a new cluster
   - Get your connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/cobuilder`

2. **Alternative: Use Render's MongoDB**
   - In Render dashboard, create a new MongoDB service
   - Use the provided connection string

## Step 2: Deploy Backend

1. **Connect your repository to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the backend service**
   - **Name**: `cobuilder-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Set Environment Variables**
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render will override this)
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A strong random string (use a password generator)
   - `GOOGLE_API_KEY`: Your Google AI API key
   - `FRONTEND_URLS`: Your frontend URL (will be set after frontend deployment)
   - `REDIS_HOST`: (Optional) Redis host if using Redis
   - `REDIS_PORT`: (Optional) Redis port if using Redis
   - `REDIS_PASSWORD`: (Optional) Redis password if using Redis

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the URL (e.g., `https://cobuilder-backend.onrender.com`)

## Step 3: Deploy Frontend

1. **Create a new static site**
   - In Render dashboard, click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure the frontend service**
   - **Name**: `cobuilder-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Set Environment Variables**
   - `VITE_API_URL`: Your backend URL (e.g., `https://cobuilder-backend.onrender.com`)

4. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment to complete
   - Note the URL (e.g., `https://cobuilder-frontend.onrender.com`)

## Step 4: Update Backend CORS

1. **Update FRONTEND_URLS in backend**
   - Go back to your backend service in Render
   - Update the `FRONTEND_URLS` environment variable
   - Set it to your frontend URL: `https://cobuilder-frontend.onrender.com`
   - Redeploy the backend service

## Step 5: Test Your Deployment

1. **Test the backend**
   - Visit your backend URL + `/` (e.g., `https://cobuilder-backend.onrender.com/`)
   - Should see "Hello World"

2. **Test the frontend**
   - Visit your frontend URL
   - Try to register/login
   - Test the collaboration features

## Environment Variables Reference

### Backend Variables
```bash
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cobuilder
JWT_SECRET=your-super-secret-jwt-key
GOOGLE_API_KEY=your-google-ai-api-key
FRONTEND_URLS=https://your-frontend-app.onrender.com
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Frontend Variables
```bash
VITE_API_URL=https://your-backend-app.onrender.com
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Make sure `FRONTEND_URLS` in backend includes your exact frontend URL
   - Check that the URL doesn't have trailing slashes

2. **Database Connection Issues**
   - Verify your MongoDB connection string
   - Make sure your IP is whitelisted in MongoDB Atlas
   - Check that the database name is correct

3. **Build Failures**
   - Check the build logs in Render
   - Make sure all dependencies are in package.json
   - Verify Node.js version compatibility

4. **Environment Variables Not Working**
   - Make sure variable names are exactly as shown
   - Check that there are no extra spaces
   - Redeploy after changing environment variables

### Getting Help

- Check Render's [documentation](https://render.com/docs)
- Review the build logs in your Render dashboard
- Check the application logs for runtime errors

## Security Notes

- Never commit `.env` files to your repository
- Use strong, unique JWT secrets
- Keep your API keys secure
- Regularly update dependencies
- Monitor your application logs

## Scaling

- Render's free tier has limitations
- Consider upgrading to paid plans for production use
- Monitor your usage and performance
- Set up proper logging and monitoring 