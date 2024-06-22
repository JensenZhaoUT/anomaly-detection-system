# sync
rsync -avz --exclude-from='rsync-exclude.txt' \-e "ssh -i ~/.ssh/medium-jensen.pem" \. ubuntu@:~/app

# Contains DB information
mysql -h database-anomaly-detection.clskoem8w7z5.us-east-1.rds.amazonaws.com -u admin -p database-anomaly-detection

# Install process in EC2
```
cd app
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install --save-dev @types/fluent-ffmpeg
npm install
npm install @tensorflow/tfjs-node
cd frontend/
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
```

# Start the server
```
cd app
sudo npm install -g pm2
cd frontend/
npm run build
cd ..
npx tsc
pm2 start dist/index.js --name "anomaly-detection-server"
```
