# Hyperion SAST Engine 🛡️

**Next-Gen Static Application Security Testing (SAST) Tool**

Hyperion is a deep-learning-enhanced security scanner designed to detect complex vulnerabilities like SQL Injection, Path Traversal, and RCE in Python, JavaScript, and HTML codebases.

## 🚀 Key Features

*   **Deep Taint Analysis:** Tracks data flow from source (User Input) to sink (Dangerous Function).
*   **AI Verification:** Uses LLMs to verify findings and reduce false positives.
*   **Professional Reporting:** Generates detailed HTML & CSV reports for compliance (PCI-DSS, OWASP).
*   **Dashboard:** Interactive web UI with metrics, pagination, and findings visualization.
*   **Server Mode:** Ready for deployment on remote servers.

## 📦 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/hyperion.git
    cd hyperion
    ```

2.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

## 🖥️ Usage

### 🖥️ Client / Local Application (Recommended)

1.  **Download the Code:**
    Download the ZIP from GitHub or clone the repo.
    
2.  **One-Click Install:**
    Double-click **`install_windows.bat`**.
    *   This will automatically install dependencies and create a specific virtual environment.
    *   It creates a **Shortcut on your Desktop** named "Hyperion SAST".
    
3.  **Run:**
    Double-click the **"Hyperion SAST"** shortcut on your desktop.
    
4.  **Uninstall:**
    Run **`uninstall_windows.bat`** to remove the shortcut and installed libraries.

## 🖥️ Server Deployment Usage

### Local Development
Run the dashboard locally on `127.0.0.1`:
```bash
python main.py
```

### Production / Server Mode
To allow access from other machines on the network:
```bash
run_production.bat
```
*   Access via: `http://<YOUR_SERVER_IP>:8000`

### CLI Usage
Generate a report directly from the command line:
```bash
python generate_reports.py --path "C:/path/to/project"
```

## 📊 Dashboard

The dashboard provides real-time insights:
*   **Total Findings:** Aggregate count of all detected issues.
*   **Unique Findings:** Deduplicated count based on rule and location.
*   **Categories:** Breakdown by vulnerability type.

## 🛠️ Technology Stack

*   **Backend:** Python, FastAPI, Uvicorn
*   **Frontend:** HTML5, CSS3 (Glassmorphism), Vanilla JS
*   **Analysis:** Abstract Syntax Trees (AST), Taint Propagation
*   **Reporting:** Jinja2 Templating

## 📄 License
Proprietary / Internal Use Only.
