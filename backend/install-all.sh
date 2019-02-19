npm install -d

cd game-server
npm install -d

cd ../web-server
npm install -d

cd ..
cp ./test/fix/sioconnector.js ./game-server/node_modules/pomelo/lib/connectors/
