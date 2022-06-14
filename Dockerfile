#FROM    node:14.19.1-buster-slim
FROM timbru31/java-node:11-jre-14
WORKDIR /usr/src/app
COPY    src/ src/
WORKDIR /usr/src/app/src
EXPOSE 8080
RUN npm install
CMD [ "node", "index.js" ]
