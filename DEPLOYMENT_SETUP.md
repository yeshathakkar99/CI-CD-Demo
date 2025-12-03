# CI/CD Deployment Setup Guide

This guide will help you configure GitHub Actions to automatically build and deploy your Express.js TypeScript application to your EC2 server.

## Prerequisites

### 1. EC2 Server Requirements

Your EC2 instance should have:
- **Node.js** (v20.x recommended) installed
- **PM2** installed globally (or it will be auto-installed during deployment)
- **SSH access** configured
- **Firewall rules** allowing traffic on your application port (default: 7000)

### 2. Install Node.js on EC2 (if not already installed)

```bash
# Connect to your EC2 instance
ssh your-user@your-ec2-ip

# Install Node.js using NodeSource (recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install PM2 on EC2

```bash
npm install -g pm2
```

### 4. Generate SSH Key Pair (if you don't have one)

```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# Copy the public key to your EC2 server
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub your-user@your-ec2-ip

# Or manually add the public key to ~/.ssh/authorized_keys on EC2
```

## GitHub Secrets Configuration

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add the following secrets:

### Required Secrets

1. **`EC2_SSH_PRIVATE_KEY`**
   - The **private** SSH key content (the one without `.pub` extension)
   - Copy the entire content including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`
   - Example: `cat ~/.ssh/github_actions_deploy` (copy entire output)

2. **`EC2_HOST`**
   - Your EC2 instance's public IP address or domain name
   - Example: `54.123.45.67` or `ec2.example.com`

3. **`EC2_USER`**
   - The SSH username for your EC2 instance
   - Common values: `ubuntu` (Ubuntu), `ec2-user` (Amazon Linux), `admin` (Debian)
   - Example: `ubuntu`

### Optional Secrets

4. **`EC2_DEPLOY_PATH`** (Optional)
   - Custom deployment path on your EC2 server
   - Default: `/home/{EC2_USER}/app`
   - Example: `/var/www/myapp`

5. **`PORT`** (Optional)
   - Application port number
   - Default: `7000` (as defined in your code)
   - Example: `8000`

## Environment Variables on EC2

Make sure to create a `.env` file on your EC2 server in the deployment directory:

```bash
# On your EC2 server
cd /home/ubuntu/app  # or your custom deploy path
nano .env
```

Add your environment variables:
```env
PORT=7000
NODE_ENV=production
# Add other environment variables as needed
```

## Security Best Practices

1. **SSH Key Security**
   - Use a dedicated SSH key pair for GitHub Actions
   - Never commit private keys to your repository
   - Rotate keys periodically

2. **Firewall Configuration**
   - Only allow SSH (port 22) from trusted IPs
   - Configure security groups to allow your application port
   - Consider using a VPN or bastion host

3. **EC2 Security Group**
   - Allow inbound traffic on port 22 (SSH) from GitHub Actions IPs
   - Allow inbound traffic on your application port (e.g., 7000) from required sources

4. **GitHub Secrets**
   - Regularly rotate secrets
   - Use least privilege principle
   - Review who has access to repository secrets

## Testing the Deployment

1. **Test SSH Connection Manually**
   ```bash
   ssh -i ~/.ssh/github_actions_deploy your-user@your-ec2-ip
   ```

2. **Trigger Workflow**
   - Push to `main` or `master` branch, or
   - Go to **Actions** tab → **Build and Deploy to EC2** → **Run workflow**

3. **Monitor Deployment**
   - Check the Actions tab for workflow progress
   - SSH into EC2 and check PM2 status: `pm2 status`
   - Check application logs: `pm2 logs express-app`

## Troubleshooting

### SSH Connection Fails
- Verify `EC2_SSH_PRIVATE_KEY` is correctly formatted (include headers/footers)
- Check `EC2_HOST` and `EC2_USER` are correct
- Ensure EC2 security group allows SSH from GitHub Actions IPs
- Verify SSH key is added to `~/.ssh/authorized_keys` on EC2

### Build Fails
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`
- Review build logs in GitHub Actions

### Deployment Fails
- Check PM2 is installed: `pm2 --version`
- Verify deployment path exists and has write permissions
- Check application logs: `pm2 logs express-app`
- Ensure `.env` file exists with required variables

### Application Not Responding
- Check if PM2 process is running: `pm2 status`
- Verify port is not blocked by firewall
- Check application logs: `pm2 logs express-app`
- Ensure environment variables are set correctly

## Manual Rollback

If deployment fails, you can manually rollback:

```bash
# SSH into EC2
ssh your-user@your-ec2-ip

# Navigate to deployment directory
cd /home/ubuntu/app  # or your deploy path

# List backups
ls -la backups/

# Restore from backup
cd backups/YYYYMMDD_HHMMSS  # latest backup
cp -r dist ../../
cp package.json ../../
cp ecosystem.config.cjs ../../

# Restart PM2
cd ../../
pm2 restart express-app
```

## Workflow Features

- ✅ Automatic build and type checking
- ✅ Build verification before deployment
- ✅ Automatic backup of previous deployment
- ✅ PM2 process management
- ✅ Health check after deployment
- ✅ Error handling and rollback capability
- ✅ Deployment history and logs

