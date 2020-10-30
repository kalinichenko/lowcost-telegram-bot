FROM node:15

WORKDIR /app

COPY ./package.json .
COPY ./yarn.lock .

RUN cd /app   
RUN yarn install --frozen-lockfile --non-interactive --no-progress --ignore-scripts
COPY . .
RUN yarn build
