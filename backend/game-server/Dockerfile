FROM node:8.12.0
RUN npm config set registry https://registry.npm.taobao.org
COPY . /app
WORKDIR /app
RUN npm install pomelo -g
RUN npm install -d
RUN mv ./fix.lock ./node_modules/pomelo/lib/connectors/sioconnector.js
EXPOSE 3005
EXPOSE 3011
EXPOSE 3015
EXPOSE 3150
EXPOSE 3251
CMD pomelo start
# local: docker run -d --name game-server -p 3015:3015 -p 3150:3150 -p 3251:3251 -p 3005:3005 -p 3011:3011 features/game-server
