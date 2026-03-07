# 🚀 Quick Start Guide - Test Cricket Universe

## ⚠️ IMPORTANT: Follow these steps IN ORDER

### Step 1: Install MongoDB

```bash
# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository (Ubuntu 22.04)
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl daemon-reload
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify it's running
sudo systemctl status mongod
```

### Step 2: Start Backend Server

Open a NEW terminal:

```bash
cd backend
npm run dev
```

✅ Backend should start on http://localhost:5000

### Step 3: Start ML Service

Open a NEW terminal:

```bash
cd ml-service
./install.sh    # First time only - creates virtual environment
./start.sh      # Starts the service
```

✅ ML Service should start on http://localhost:5001

### Step 4: Start Frontend

Open a NEW terminal:

```bash
cd client
npm run dev
```

✅ Frontend should start on http://localhost:5173

---

## 🎯 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/health
- **ML Service**: http://localhost:5001/health

---

## 🔧 Troubleshooting

### Backend won't start?

Check if MongoDB is running:
```bash
sudo systemctl status mongod
```

If not running:
```bash
sudo systemctl start mongod
```

### ML Service won't start?

The install script creates a virtual environment. Make sure you run:
```bash
cd ml-service
./install.sh
./start.sh
```

### Frontend won't start?

If you see PostCSS errors:
```bash
cd client
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run dev
```

---

## 📚 Full Documentation

See `docs/SETUP.md` for complete setup instructions and troubleshooting.

---

## ✅ Verification Checklist

- [ ] MongoDB is running (`sudo systemctl status mongod`)
- [ ] Backend is running on port 5000
- [ ] ML Service is running on port 5001
- [ ] Frontend is running on port 5173
- [ ] Can access http://localhost:5173 in browser

---

## 🎉 You're Ready!

All three services should now be running. Open http://localhost:5173 in your browser to use the application.
