# sync
rsync -avz --exclude-from='rsync-exclude.txt' \-e "ssh -i ~/.ssh/medium-jensen.pem" \. ubuntu@:~/app

# Contains DB information
mysql -h database-anomaly-detection.clskoem8w7z5.us-east-1.rds.amazonaws.com -u admin -p database-anomaly-detection

# Install process in EC2
```
cd app
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

# Start the server
```
cd frontend/
npm run build
cd ..
npx tsc
cp -r /home/ubuntu/app/src/utils/group1-shard1of2.bin ./
cp -r /home/ubuntu/app/src/utils/group1-shard2of2.bin ./
cp -r /home/ubuntu/app/src/utils/model.json ./
pm2 start dist/index.js --name "anomaly-detection-server"
```


./darknet detector test data/obj.data yolo-obj.cfg backup/yolo-obj_best.weights -ext_output data/test_image.jpg
./darknet detector demo data/obj.data yolo-obj.cfg backup/yolo-obj_best.weights -ext_output data/video.mp4

# ESLINT test
```
npm install eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-config-prettier eslint-plugin-prettier prettier --save-dev
npm install typescript@5.1.6 --save-dev
npm run lint
```