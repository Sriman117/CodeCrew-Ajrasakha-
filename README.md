# 🌱 MittiScan AI - Soil Health Analysis Platform

**MittiScan AI** is a modern, full-stack application designed to farmers and agronomists by digitizing Soil Health Cards. Using AI-powered OCR, it extracts nutrient data (N, P, K, pH) from physical cards and provides instant, actionable fertilizer recommendations.

![Status](https://img.shields.io/badge/Status-Active-success)
![Stack](https://img.shields.io/badge/Stack-MERN-blue)

## Key Features

*   **📄 AI-Powered OCR:** Instantly scans and extracts text from images or PDFs of Soil Health Cards.
*   **📊 Interactive Dashboard:** Visualizes soil nutrient levels with dynamic radial gauges and comparative bar charts.
*   **📈 Trend Tracking:** Maintains a history of all scans to track soil health improvements over time.
*   **💡 Smart Recommendations:** Provides tailored fertilizer suggestions (e.g., Urea, DAP) based on soil deficiencies and selected crops.
*   **🛒 Commerce Integration:** Directly links recommended products to online retailers (Amazon/Google).
*   **📱 Mobile Optimized:** Fully responsive UI that works seamlessly on desktop, tablets, and mobile devices.

## Tech Stack

### Frontend
*   **React 19:** Core UI library.
*   **Recharts:** For data visualization (Gauges, Charts).
*   **CSS Modules:** For scoped, high-performance styling.

### Backend
*   **Node.js & Express:** Robust API server.
*   **MongoDB:** Data persistence for user scans and trends.
*   **Tesseract.js / Vision API:** (Planned) For OCR processing.

## Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas URI) - Ensure it's running!

### Quick Start (Windows)

1.  **Clone the repository**
    ```bash
    git clone https://github.com/CodeCrew-Ajrasakha-/MittiScan.git
    cd MittiScan
    ```

2.  **First Time Setup**
    Double-click `install.bat` (or run it in terminal).  
    *This installs all dependencies for both backend and frontend.*

3.  **Run the App**
    Double-click `start.bat` (or run it in terminal).  
    *This launches both the backend API and frontend React app concurrently.*
    *   Frontend: `http://localhost:3000`
    *   Backend: `http://localhost:5000`

### Manual Setup (Linux/Mac)

1.  **Backend**
    ```bash
    cd backend && npm install && npm start
    ```

2.  **Frontend**
    ```bash
    cd frontend && npm install && npm start
    ```

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/soil/scan` | Uploads an image and returns extracted soil data. |
| `POST` | `/api/soil/analyze` | Analyzes soil data and returns recommendations. |
| `GET` | `/api/trends` | Fetches historical scan data for the user. |
| `GET` | `/api/analytics/metrics` | Returns community impact stats (Total Scans, Savings). |

## Contributing
Contributions are welcome! Please fork the repo and submit a PR.

---
*Built with 💚 for CodeCrew Ajrasakha*
