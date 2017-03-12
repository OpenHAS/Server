echo "Building a new container from the source.... it will take a while"
CONTAINER_ID="$(docker build -q .)"
echo "Container ID: ${CONTAINER_ID}"
docker tag ${CONTAINER_ID} openhas/server:latest
docker push openhas/server
echo "Finished. Image pushed to Docker HUB"

