FROM node:8.12.0
RUN npm config set registry https://registry.npm.taobao.org
COPY . /app
WORKDIR /app
RUN npm install -d
EXPOSE 8002
CMD node server

# local: docker run -d --name web-server -p 8002:8002 features/web-pomelo-server
