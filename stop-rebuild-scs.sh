# This script assumes the existence of two docker objects:
# - scs-server, a docker image
# - scs-server-instance, a docker container of the scs-server image
# The script will stop the scs-server-instance, remove it, and remove the scs-server image
# Then it rebuilds the scs-server image from the working directory and restarts the scs-server-instance
docker container stop scs-server-instance
docker container rm scs-server-instance
docker image rm scs-server
docker build -t scs-server .
docker run --name scs-server-instance -d --restart unless-stopped -p 8050:8222 scs-server