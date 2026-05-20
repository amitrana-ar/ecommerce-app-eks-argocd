#stage 1
FROM node:16.20.1 AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
#stage 2
FROM node:16.20.1-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
#RUN echo "npm install completed successfully!"
COPY . .
EXPOSE 80
CMD ["npm","run","start"]