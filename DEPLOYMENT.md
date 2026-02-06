# ☁️ Deployment Guide: Oracle Cloud Free Tier

This guide explains how to deploy Hyperion SAST on **Oracle Cloud "Always Free" Tier**.

## ✅ Is it Useful?
**Yes, extremely.**
Oracle Cloud offers the **most generous free tier** of any provider.
*   **Specs:** 4 ARM Cores (Ampere), **24 GB RAM**.
*   **Cost:** $0.00 / month (Forever).
*   **Performance:** This is far more powerful than AWS or Google free tiers (which usually give 1GB RAM). It can easily handle Hyperion scans + other apps.

---

## 🚀 Step-by-Step Setup

### Phase 1: Create the Server
1.  **Sign Up** at [cloud.oracle.com](https://www.oracle.com/cloud/free/).
    *   *Note: They verify identity with a credit card ($1 charge, refunded).*
2.  **Create VM Instance:**
    *   Go to **Compute** -> **Instances** -> **Create Instance**.
    *   **Image:** Canonical Ubuntu 22.04 or 24.04.
    *   **Shape:** Select **Ampere (VM.Standard.A1.Flex)**. maximize the OCPUs to 4 and RAM to 24GB (it's free!).
3.  **SSH Keys:**
    *   Download the **Private Key** and **Public Key** when prompted. **Keep these safe!**
4.  **Create:** Click Create and wait for it to turn Green (Running). Note your **Public IP**.

### Phase 2: Configure Network (Open Port 8000)
By default, Oracle blocks all ports. You need to open Port 8000.
1.  Click on your Instance name.
2.  Click the **Subnet** link (usually `subnet-xxxx`).
3.  Click the **Security List** (usually `Default Security List...`).
4.  **Add Ingress Rule:**
    *   **Source CIDR:** `0.0.0.0/0` (Allowed from anywhere)
    *   **Destination Port Range:** `8000`
    *   **Description:** Hyperion Dashboard
5.  Click **Add Ingress Rules**.

### Phase 3: Connect & Install
1.  **Connect via SSH** (from your local terminal):
    ```bash
    ssh -i "path/to/private.key" ubuntu@<YOUR_PUBLIC_IP>
    ```

2.  **Install System Dependencies:**
    ```bash
    sudo apt update
    sudo apt install python3-pip git -y
    ```

3.  **Firewall Fix (Important for Oracle):**
    Oracle instances have a second internal firewall (iptables). Run this to open port 8000 internally:
    ```bash
    sudo iptables -I INPUT -p tcp -m tcp --dport 8000 -j ACCEPT
    sudo netfilter-persistent save
    ```

4.  **Download & Run Hyperion:**
    ```bash
    git clone <YOUR_GITHUB_REPO_URL>
    cd hyperion
    pip install -r requirements.txt
    
    # Run in background (so it stays running even if you disconnect)
    nohup ./run_production.sh &
    ```

### Phase 4: Access
Open your browser:
**`http://<YOUR_PUBLIC_IP>:8000`**

---

## 🔒 Security Note
Since this is open to the internet (`0.0.0.0`), anyone with the IP can see your dashboard.
**Recommendation:** If you use this permanently, add a Basic Auth login system or use a VPN.
