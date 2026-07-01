FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install

COPY server/ ./server/

EXPOSE 3001

CMD ["cd", "server", "&&", "npm", "run", "dev"]