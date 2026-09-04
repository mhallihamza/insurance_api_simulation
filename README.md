Markdown
# Express.js Insurance API Simulation

A lightweight Express.js backend server located at `src/server.js` that provides mock insurance verification and coverage endpoints for Moroccan insurance providers (**CNSS**, **CNOPS**, and **AtlantaSanad**). This project is optimized for local testing and external workflow integration via **ngrok**.

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:

* **Node.js** (v18.x or higher)
* **npm** or **yarn**
* **ngrok CLI** ([Download ngrok](https://ngrok.com/download))

---

## 🛠️ Installation & Configuration

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/mhallihamza/insurance_api_simulation.git](https://github.com/mhallihamza/insurance_api_simulation.git)
   cd insurance_api_simulation
Install dependencies:

Bash
npm install
Configure Environment Variables:

Create a .env file in the root folder:

Code snippet
PORT=5000
🚀 Running the Express Server
To start the server located in src/server.js:

Bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
By default, the application will run locally at http://localhost:5000.

🌐 Exposing the Local Server with ngrok
To connect this local API with cloud workflows, webhooks, or external integration tools, create an HTTP tunnel using ngrok:

Authenticate ngrok (if not done previously):

Bash
ngrok config add-authtoken YOUR_NGROK_AUTHTOKEN
Start the tunnel on port 5000:

Bash
ngrok http 5000
Copy the generated HTTPS URL:

ngrok will generate a secure public link:

Plaintext
Forwarding   [https://a1b2-34-56-78-90.ngrok-free.app](https://a1b2-34-56-78-90.ngrok-free.app) -> http://localhost:5000
Use this public https://... address as your base URL in external API requests.

📁 Project Structure
Plaintext
insurance_api_simulation/
├── data/
│   ├── atlanta_sanad.json  # Mock data for AtlantaSanad insurance
│   ├── cnops.json          # Mock data for CNOPS insurance
│   └── cnss_amo.json       # Mock data for CNSS / AMO insurance
├── src/
│   └── server.js           # Main Express application entry point
├── .env                    # Local environment config
├── .gitignore              # Files excluded from version control
├── package.json
└── package-lock.json
🧪 API Usage & Testing
Once both your Express server and ngrok tunnel are running, test your endpoints using Postman, cURL, or your workflow tool:

Local Health Check:

GET http://localhost:5000/

Public Verification Endpoint (via ngrok):

POST https://<your-ngrok-subdomain>.ngrok-free.app/api/check-insurance
