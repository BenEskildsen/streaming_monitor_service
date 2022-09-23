FROM tiangolo/nginx-rtmp

# FROM node:12
# WORKDIR /www
# COPY package*.json ./
# RUN npm install
# COPY server.js ./
# CMD ["npm", "start"]

COPY bin/bundle.js /www/

COPY nginx.conf /etc/nginx/nginx.conf
COPY index.html /www/



