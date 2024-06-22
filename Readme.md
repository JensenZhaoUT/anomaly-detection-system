# sync
rsync -avz --exclude-from='rsync-exclude.txt' \-e "ssh -i ~/.ssh/web-server-jensen.pem" \. ubuntu@ec2-204-236-200-61.compute-1.amazonaws.com:~/app

# Contains DB information
