const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Mock Data Storage
let complaints = [];
let reports = [];
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', credits: 75 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', credits: 120 },
  { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'admin', credits: 0 },
  { id: 4, name: 'Alice Johnson', email: 'alice@example.com', role: 'user', credits: 95 },
  { id: 5, name: 'Bob Wilson', email: 'bob@example.com', role: 'user', credits: 50 }
];

let workers = [
  { id: 1, name: 'Worker Alpha', phone: '123-456-7890', price_steel: 15, price_plastic: 8, price_paper: 5, area: 'North District' },
  { id: 2, name: 'Worker Beta', phone: '234-567-8901', price_steel: 12, price_plastic: 10, price_paper: 4, area: 'South District' },
  { id: 3, name: 'Worker Gamma', phone: '345-678-9012', price_steel: 18, price_plastic: 7, price_paper: 6, area: 'East District' },
  { id: 4, name: 'Worker Delta', phone: '456-789-0123', price_steel: 14, price_plastic: 9, price_paper: 5, area: 'West District' },
  { id: 5, name: 'Worker Epsilon', phone: '567-890-1234', price_steel: 16, price_plastic: 8, price_paper: 7, area: 'Central District' }
];

let redeemCodes = [];
let complaintIdCounter = 1;
let reportIdCounter = 1;

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  
  if (user) {
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits
      },
      token: 'mock-jwt-token'
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Complaints Routes
app.get('/api/complaints', (req, res) => {
  const { userId, role } = req.query;
  
  if (role === 'admin') {
    res.json(complaints);
  } else {
    const userComplaints = complaints.filter(c => c.userId == userId);
    res.json(userComplaints);
  }
});

app.post('/api/complaints', (req, res) => {
  const { userId, name, location, description, photo } = req.body;
  
  const complaint = {
    id: complaintIdCounter++,
    userId: parseInt(userId),
    name,
    location,
    description,
    photo: photo || null,
    status: 'pending',
    assignedWorker: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  complaints.push(complaint);
  console.log('New complaint submitted:', complaint.id);
  
  res.json({ success: true, complaint });
});

app.put('/api/complaints/:id/assign', (req, res) => {
  const { id } = req.params;
  const { workerId } = req.body;
  
  const complaint = complaints.find(c => c.id == id);
  const worker = workers.find(w => w.id == workerId);
  
  if (complaint && worker) {
    complaint.assignedWorker = worker;
    complaint.status = 'assigned';
    complaint.updatedAt = new Date().toISOString();
    
    console.log(`Complaint ${id} assigned to worker ${worker.name}`);
    
    res.json({ success: true, complaint });
  } else {
    res.status(404).json({ success: false, message: 'Complaint or worker not found' });
  }
});

app.put('/api/complaints/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const complaint = complaints.find(c => c.id == id);
  
  if (complaint) {
    complaint.status = status;
    complaint.updatedAt = new Date().toISOString();
    
    res.json({ success: true, complaint });
  } else {
    res.status(404).json({ success: false, message: 'Complaint not found' });
  }
});

// Reports Routes
app.get('/api/reports', (req, res) => {
  res.json(reports);
});

app.post('/api/reports', (req, res) => {
  const { userId, complaintId, description } = req.body;
  
  const report = {
    id: reportIdCounter++,
    userId: parseInt(userId),
    complaintId: parseInt(complaintId),
    description,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  reports.push(report);
  console.log('New report submitted:', report.id);
  
  res.json({ success: true, report });
});

app.put('/api/reports/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const report = reports.find(r => r.id == id);
  
  if (report) {
    report.status = status;
    
    res.json({ success: true, report });
  } else {
    res.status(404).json({ success: false, message: 'Report not found' });
  }
});

// Users & Credits Routes
app.get('/api/users', (req, res) => {
  res.json(users.filter(u => u.role === 'user'));
});

app.get('/api/users/:id/credits', (req, res) => {
  const { id } = req.params;
  const user = users.find(u => u.id == id);
  
  if (user) {
    res.json({ credits: user.credits });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.post('/api/users/:id/credits', (req, res) => {
  const { id } = req.params;
  const { credits } = req.body;
  
  const user = users.find(u => u.id == id);
  
  if (user) {
    user.credits += credits;
    
    res.json({ success: true, user });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

app.post('/api/credits/redeem', (req, res) => {
  const { userId } = req.body;
  const user = users.find(u => u.id == userId);
  
  if (user && user.credits >= 100) {
    user.credits -= 100;
    
    const redeemCode = {
      id: Date.now(),
      code: `ECO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      userId: user.id,
      createdAt: new Date().toISOString(),
      redeemed: false
    };
    
    redeemCodes.push(redeemCode);
    
    res.json({ success: true, redeemCode });
  } else {
    res.status(400).json({ success: false, message: 'Insufficient credits' });
  }
});

// Workers Routes
app.get('/api/workers', (req, res) => {
  res.json(workers);
});

// Green Champion Route
app.get('/api/green-champion', (req, res) => {
  const champion = users
    .filter(u => u.role === 'user')
    .reduce((max, user) => user.credits > max.credits ? user : max);
  
  res.json(champion);
});

// Redeem Codes Routes
app.get('/api/redeem-codes', (req, res) => {
  res.json(redeemCodes);
});

// Serve uploaded files
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
  console.log(`🌱 Waste Management API Server running on http://localhost:${PORT}`);
  console.log(`📊 Mock data initialized with ${users.length} users, ${workers.length} workers`);
});