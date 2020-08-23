FROM node:lts

WORKDIR /app

COPY ./package.json ./yarn.lock

RUN cd /app   
RUN yarn install --frozen-lockfile --non-interactive --no-progress  
COPY ./ /app
RUN cd /app && yarn build
