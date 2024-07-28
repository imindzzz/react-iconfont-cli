#!/usr/bin/env bash

rm -rf snapshots/demo-js
rm -rf snapshots/demo-ts

cp -f ./scripts/config/demo-js.json ./iconfont.json
npx ts-node src/commands/createIcon.ts

cp -f ./scripts/config/demo-ts.json ./iconfont.json
npx ts-node src/commands/createIcon.ts

cp -rf ./snapshots/demo-ts/* ../app/components/Icon
cd ../app/
npm run prettier
