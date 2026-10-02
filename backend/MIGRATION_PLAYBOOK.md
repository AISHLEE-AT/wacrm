# SuprO Ecosystem: Oracle Cloud Ampere A1 Migration Playbook
**Always Free Tier: 4 OCPUs | 24 GB RAM | 200 GB Storage | $0.00/Month**

---

## 1. Prerequisites (In Oracle Cloud Console)
1. Log in to [cloud.oracle.com](https://cloud.oracle.com).
2. Go to **Compute** -> **Instances** -> **Create Instance**.
3. Choose:
   - **Name**: `supro-ampere-prod`
   - **Image**: `Ubuntu 24.04 LTS (aarch64 / ARM)`
   - **Shape**: `Ampere VM.Standard.A1.Flex`
   - **OCPUs**: `4`
   - **RAM**: `24 GB`
   - **Boot Volume**: `200 GB` (Within Always Free 200 GB allocation)
   - **Networking**: Assign Public IPv4
   - **SSH Key**: Upload your public key (`oci_key.key.pub`)

---

## 2. One-Click Provisioning Script (On New Ampere Server)
SSH into the new Ampere server:
```bash
ssh -i oci_key.key ubuntu@<NEW_AMPERE_IP>
```

Run this automated setup script:
```bash
# 1. Update & Install Docker + Docker Compose + NGINX + Certbot
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl git ufw nginx certbot python3-certbot-nginx

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# 3. Setup 8GB Swap (Optimal for 24GB Server)
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 4. Clone / Deploy SuprO Backend
mkdir -p /home/ubuntu/supro_backend
mkdir -p /home/ubuntu/backups
mkdir -p /var/www/cdn
```

---

## 3. Database Restoration from Current Backup
From your local machine (`D:\w`):
```powershell
# Copy the latest verified backup to the new server:
scp -i D:\w\oci_key.key D:\w\backend\backups\supro_db_backup_current.sql.gz ubuntu@<NEW_AMPERE_IP>:/home/ubuntu/backups/

# Copy the entire modular backend:
scp -i D:\w\oci_key.key -r D:\w\backend/* ubuntu@<NEW_AMPERE_IP>:/home/ubuntu/supro_backend/
```

On the new Ampere server:
```bash
cd /home/ubuntu/supro_backend

# 1. Start PostgreSQL Container
docker compose up -d db

# 2. Wait 5 seconds for PostgreSQL to initialize
sleep 5

# 3. Restore Database from Compressed Backup
gunzip -c /home/ubuntu/backups/supro_db_backup_current.sql.gz | docker exec -i supro_db psql -U postgres -d supro

# 4. Build and Start Node 22 LTS Modular Backend
docker compose up -d --build
```

---

## 4. DuckDNS Domain Switchover (Zero Downtime)
Update your DuckDNS IP address:
```bash
curl "https://www.duckdns.org/update?domains=mysupro,mysupro-crm,mysupro-cdn&token=<DUCKDNS_TOKEN>&ip=<NEW_AMPERE_IP>"
```

Generate SSL Certificates on new server:
```bash
sudo certbot --nginx -d mysupro.duckdns.org -d mysupro-crm.duckdns.org -d mysupro-cdn.duckdns.org
```

---

## 5. Verification
Run our integration suite locally:
```powershell
node D:\w\test_oci_apis.js
```
All endpoints will immediately respond with 24 GB of RAM and 4 ARM64 cores backing your APIs!
