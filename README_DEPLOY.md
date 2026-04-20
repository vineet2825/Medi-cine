# Deployment Instructions for Medicine Stock System

Follow these steps to take your website live.

## 1. GitHub (Prepare your code)
Make sure your project is pushed to GitHub.
```bash
git init
git add .
git commit -m "Deployment ready"
# Create a repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/medicine-stock-system.git
git push -u origin main
```

## 2. Backend Deployment (Render.com)
1. Go to [Render](https://render.com/) and create a **Web Service**.
2. Connect your GitHub Repo.
3. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. **Environment Variables** (Add these in the "Env Vars" tab):
   - `MONGO_URI`: `mongodb+srv://vineetvijay0p_db_user:r0753TBZO3nHImJG@medicine.i4lovdm.mongodb.net/medicine_db?retryWrites=true&w=majority`
   - `JWT_SECRET`: `your_random_secret_string`
   - `PORT`: `5000`
5. Click **Deploy**. Copy the URL Render gives you (e.g., `https://my-api.onrender.com`).

## 3. Frontend Deployment (Vercel.com)
1. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Connect your GitHub Repo.
3. Settings:
   - **Root Directory:** `client`
   - **Framework Preset:** `Create React App`
4. **Environment Variables**:
   - Add a variable named `REACT_APP_API_URL`.
   - Set the value to: `https://your-render-url.onrender.com/api` (Make sure to add `/api` at the end).
5. Click **Deploy**.

## 4. Final Step (CORS)
Once you have your Vercel URL (e.g., `https://medicine-app.vercel.app`), go back to your **Render** settings and add an environment variable:
- `ALLOWED_ORIGIN`: `https://medicine-app.vercel.app`

---
### Done!
Your website will now be live on your Vercel URL.
