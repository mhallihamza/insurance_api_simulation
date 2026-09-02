const express = require('express');
const dotenv = require("dotenv");
dotenv.config();
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Load provider database files dynamically
// Replace line 11 in src/server.js with this:
const loadData = (filename) => {
  const filePath = path.join(__dirname, '..', 'data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const cnssDb = loadData('cnss_amo.json');
const cnopsDb = loadData('cnops.json');
const atlantaDb = loadData('atlanta_sanad.json');

// Helper: Authentication verification
const checkAuth = (req, res, headerName, expectedValue) => {
  const headerVal = req.header(headerName);
  if (!headerVal || headerVal !== expectedValue) {
    res.status(401).json({
      error: "UNAUTHORIZED",
      message: `Missing or invalid header: ${headerName}`
    });
    return false;
  }
  return true;
};

// Generic Coverage Engine based on num_immatriculation key lookup
const processClaim = (database, key, submittedAmount) => {
  const record = database[key];

  if (!record) {
    return {
      status: "REJECTED",
      reason: "NUM_IMMATRICULATION_NOT_FOUND",
      amount_covered: 0,
      reste_a_charge: submittedAmount
    };
  }

  if (record.status !== "ACTIVE") {
    return {
      status: "REJECTED",
      reason: `POLICY_STATUS_${record.status}`,
      amount_covered: 0,
      reste_a_charge: submittedAmount
    };
  }

  const rawCovered = submittedAmount * record.coverage_rate;
  const maxCap = record.max_cap || Infinity;
  const coveredAmount = parseFloat(Math.min(rawCovered, maxCap).toFixed(2));
  const remainingGap = parseFloat((submittedAmount - coveredAmount).toFixed(2));

  return {
    status: "APPROVED",
    subscriber_name: record.full_name,
    tier: record.tier,
    coverage_rate: `${record.coverage_rate * 100}%`,
    cap_applied: rawCovered > maxCap,
    amount_covered: coveredAmount,
    reste_a_charge: remainingGap
  };
};

// ==========================================
// 1. CNSS (AMO) Endpoint
// ==========================================
app.post('/v1/coverage/check', (req, res) => {
  if (!checkAuth(req, res, 'X-CNSS-API-Key', process.env.X_CNSS_API_KEY)) return;

  const { num_immatriculation, montant_total } = req.body;
  const result = processClaim(cnssDb, num_immatriculation, parseFloat(montant_total) || 0);

  return res.status(result.status === "APPROVED" ? 200 : 400).json({
    provider: "CNSS_AMO",
    num_immatriculation: num_immatriculation,
    montant_soumis: montant_total,
    ...result
  });
});

// ==========================================
// 2. CNOPS Endpoint
// ==========================================
app.post('/v2/eligibility', (req, res) => {
  if (!checkAuth(req, res, 'authorization', 'Bearer u0BiYwVApfVSpoOOSuzE/wGXKWCaCDINOfQHZhOyAZs=')) return;
  console.log("Received Headers:", req.headers);
  console.log("Received Body:", req.body);
  const { matricule, total_engage } = req.body;
  const result = processClaim(cnopsDb, matricule, parseFloat(total_engage) || 0);

  return res.status(result.status === "APPROVED" ? 200 : 400).json({
    provider: "CNOPS",
    num_immatriculation: matricule,
    total_engage: total_engage,
    ...result
  });
});

// ==========================================
// 3. Atlanta Sanad Endpoint
// ==========================================
app.post('/v1/atlanta/claim/verify', (req, res) => {
  if (!checkAuth(req, res, 'X-Atlanta-Key', process.env.ENV_ATLANTA_KEY)) return;

  const { policy_number, claim_total } = req.body;
  const result = processClaim(atlantaDb, policy_number, parseFloat(claim_total) || 0);

  return res.status(result.status === "APPROVED" ? 200 : 400).json({
    provider: "ATLANTA_SANAD",
    num_immatriculation: policy_number,
    claim_total: claim_total,
    ...result
  });
});

app.get('/', (req, res) => {
  res.send('Insurance Mock Server is running. Use the appropriate endpoints to test coverage checks.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Insurance Mock Server running on port ${PORT}`);
});