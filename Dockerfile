FROM node:18-alpine AS build

WORKDIR /app

COPY okved.json ./
COPY okpd2.json ./

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build && npm prune --production


FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/node_modules node_modules/
COPY --from=build /app/lib lib/
COPY --from=build /app/okved.json okved.json
COPY --from=build /app/okpd2.json okpd2.json

CMD [ "node", "lib" ]
