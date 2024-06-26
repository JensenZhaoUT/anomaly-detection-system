# Automated Anomaly Detection System

## Overview
This project implements an automated anomaly detection system using a Node.js backend, React frontend with TypeScript, and machine learning models for object detection. The system allows users to upload video clips, detects anomalies, and displays detailed alerts.

## Features
- **Frontend Framework**: React with TypeScript, Material-UI for the UI components.
- **Backend Framework**: Node.js, deployed on AWS EC2.
- **Backend Storage**: AWS RDS for anomaly alert data storage.
- **Machine Learning Integration**: YOLO(Darknet) for object detection deployed via WebAssembly.
- **YOLO Training**: On Stanford Drone Dataet with NVIDIA RTX 2070
- **Testing**: Jest for unit testing, Playwright for end-to-end testing, and ESLint for code quality.

## Requirements
- Node.js 18.x
- MySQL
- AWS EC2 instance
- AWS RDS instance
- A valid AWS account

## Setup Instructions

### Sync Application Files to EC2
```bash
rsync -avz --exclude-from='rsync-exclude.txt' \-e "ssh -i ~/.ssh/medium-jensen.pem" \. ubuntu@:~/app
```

### Database Configuration
```bash
mysql -h database-anomaly-detection.clskoem8w7z5.us-east-1.rds.amazonaws.com -u admin -p database-anomaly-detection
```

### Install Dependencies on EC2
```bash
cd ~/app
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install
npm install --save-dev @types/fluent-ffmpeg
npm install @tensorflow/tfjs-node
sudo npm install -g pm2

cd frontend/
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install react-app-rewired customize-cra
```

## Run Eslint check
```bash
npm install eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-config-prettier eslint-plugin-prettier prettier --save-dev
npm install typescript@5.1.6 --save-dev
npm run lint
```

## Unit Test with Jest
```bash
npm run test -- --coverage
```

## Playwright for End-to-End Tests
```bash
npx playwright test
```

## Continuous Integration/Continuous Deployment (CI/CD)
The project uses GitHub Actions for CI/CD. The configuration file .github/workflows/ci.yml includes steps for:

1. Installing dependencies
2. Running ESLint checks
3. Running Jest tests with coverage
4. Running Playwright tests
5. Uploading test results and coverage reports as artifacts
6. To trigger the CI/CD pipeline, push your changes to the master branch or create a pull request targeting master.

**Notes**
1. Ensure your AWS RDS instance is up and running with the correct configurations.
2. The rsync-exclude.txt should contain the files and directories you want to exclude from synchronization.

## Troubleshooting
if the server does not start, check the logs by:
```bash
pm2 logs anomaly-detection-server
```