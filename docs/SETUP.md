# Test Cricket Universe - Setup Guide

## Prerequisites

- Node.js v18.19.1 or higher
- Python 3.8 or higher
- MongoDB 6.0 or higher
- npm 9.2.0 or higher

## MongoDB Installation (Ubuntu)

### Option 1: Install MongoDB Community Edition (Recommended)

#### Step 1: Import MongoDB GPG Key

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor
```

#### Step 2: Add MongoDB Repository

For Ubuntu 22.04 (Jammy):
```bash
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
```

For Ubuntu 20.04 (Focal):
```bash
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
```

#### Step 3: Update Package List

```bash
sudo apt-get update
```

#### Step 4: Install MongoDB

```bash
sudo apt-get install -y mongodb-org
```

#### Step 5: Start MongoDB Service

```bash
sudo systemctl start mongod
```

If you receive an error that the service is not found, run:
```bash
sudo systemctl daemon-reload
sudo systemctl start mongod
```

#### Step 6: Enable MongoDB to Start on Boot

```bash
sudo systemctl enable mongod
```

#### Step 7: Verify MongoDB is Running

```bash
sudo systemctl status mongod
```

You should see "active (running)" in the output.

#### Step 8: Test MongoDB Connection

```bash
mongosh
```

Type `exit` to quit the MongoDB shell.

### Option 2: Use Docker (Alternative)

If you prefer Docker:

```bash
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

### Troubleshooting MongoDB Installation

If MongoDB fails to start:

1. Check logs:
```bash
sudo journalctl -u mongod
```

2. Check if port 27017 is already in use:
```bash
sudo lsof -i :27017
```

3. Create data directory if missing:
```bash
sudo mkdir -p /var/lib/mongodb
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo mkdir -p /var/log/mongodb
sudo chown -R mongodb:mongodb /var/log/mongodb
```

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

Create a `.env` file in the `backend/` directory with the following content:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/test-cricket-universe
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=30d
ML_SERVICE_URL=http://localhost:5001
CLIENT_URL=http://localhost:5173
```

### Step 4: Start Backend Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The backend will run on http://localhost:5000

## ML Service Setup

### Step 1: Navigate to ML Service Directory

```bash
cd ml-service
```

### Step 2: Install Python Dependencies with Virtual Environment

**IMPORTANT:** Use the install script which creates a virtual environment:

```bash
chmod +x install.sh start.sh
./install.sh
```

This will:
- Create a Python virtual environment in `ml-service/venv/`
- Install all required packages inside the virtual environment
- Avoid system-wide Python package conflicts

### Step 3: Create Environment File

Create a `.env` file in the `ml-service/` directory with the following content:

```env
PORT=5001
```

### Step 4: Start ML Service

Use the start script (recommended):
```bash
./start.sh
```

Or manually:
```bash
source venv/bin/activate
python api.py
```

The ML service will run on http://localhost:5001

## Frontend Setup

### Step 1: Navigate to Client Directory

```bash
cd client
```

### Step 2: Install Dependencies

```bash
npm install --legacy-peer-deps
```

### Step 3: Start Development Server

```bash
npm run dev
```

The frontend will run on http://localhost:5173

## Data Seeding (Optional)

To populate the database with cricket data:

### Step 1: Place YAML Files

Place your Cricsheet YAML files in the `data/cricsheet/` directory.

### Step 2: Run Seed Script

```bash
cd data
node seed.js
```

The script will parse YAML files and populate MongoDB with matches, players, venues, teams, and series data.

## Verification

Once all services are running, verify the setup:

1. Backend API: http://localhost:5000/health
2. ML Service: http://localhost:5001/health
3. Frontend: http://localhost:5173

## Troubleshooting

### MongoDB Connection Issues

If you see "MongoNetworkError" or connection refused:

1. Check if MongoDB is running:
   ```bash
   sudo systemctl status mongod
   ```

2. Restart MongoDB:
   ```bash
   sudo systemctl restart mongod
   ```

3. Check MongoDB logs:
   ```bash
   sudo tail -f /var/log/mongodb/mongod.log
   ```

### Backend Port Already in Use

If port 5000 is already in use, change the `PORT` in `backend/.env` to another port (e.g., 5001).

### ML Service Import Errors

If you see Python import errors, ensure all packages are installed:

```bash
cd ml-service
pip3 install -r requirements.txt
```

### Frontend Build Errors

If you see Tailwind or PostCSS errors:

```bash
cd client
npm install @tailwindcss/postcss --legacy-peer-deps
```

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in backend `.env`
2. Use a production MongoDB instance (MongoDB Atlas recommended)
3. Change `JWT_SECRET` to a strong random string
4. Build frontend: `cd client && npm run build`
5. Serve frontend build with a web server (nginx, Apache)
6. Use PM2 or systemd to manage Node.js processes
7. Set up SSL certificates for HTTPS

## Support

For issues or questions, refer to the project documentation or create an issue in the repository.
