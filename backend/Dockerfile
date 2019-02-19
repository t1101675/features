# Setup
FROM node:8.12.0
RUN npm config set registry https://registry.npm.taobao.org

# Test kit
COPY . /app
WORKDIR /app
RUN npm install
WORKDIR /app/test

# Pomelo kit
WORKDIR /app/game-server
RUN npm install pomelo -g
RUN npm install -d
COPY ./test/fix/sioconnector.js ./game-server/node_modules/pomelo/lib/connectors/

# Webserver kit
WORKDIR /app/web-server
RUN npm install -d

# Web-pomelo-server kit
WORKDIR /app/web-pomelo-server/
RUN npm install -d

# Ready for testing
WORKDIR /app
ENV TEST_ROOT /app
ENV PORT 80
EXPOSE 80
