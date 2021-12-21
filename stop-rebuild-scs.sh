docker container stop scs-server-instance
docker container rm scs-server-instance
docker image rm scs-server
docker build -t scs-server .
docker run --name scs-server-instance -d --restart unless-stopped -p 8050:8222 scs-server