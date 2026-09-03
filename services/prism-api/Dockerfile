FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 8000
CMD ["npm","--workspace","@setu/prism-api","run","start"]