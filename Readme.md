# sync
rsync -avz --exclude-from='rsync-exclude.txt' \-e "ssh -i ~/.ssh/medium-jensen.pem" \. ubuntu@ec2-54-198-39-31.compute-1.amazonaws.com:~/app

# Contains DB information
mysql -h database-anomaly-detection.clskoem8w7z5.us-east-1.rds.amazonaws.com -u admin -p database-anomaly-detection

# Install process in EC2
