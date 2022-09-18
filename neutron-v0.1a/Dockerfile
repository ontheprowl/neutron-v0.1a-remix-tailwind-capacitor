# base node image
FROM node:16-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl sqlite3

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /myapp

ADD package.json package-lock.json ./
RUN npm install --production=false --force

# Setup production node_modules
FROM base as production-deps

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules
ADD package.json package-lock.json ./

RUN npm prune --production --force

# Build the app
FROM base as build

WORKDIR /myapp

# Copying Cashfree credentials to Docker image
COPY cf-production-payouts.pem /myapp/
COPY cf-test-payouts.pem /myapp/
COPY serviceAccountKey.json /myapp/

COPY --from=deps /myapp/node_modules /myapp/node_modules

# ADD prisma .
# RUN npx prisma generate

ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

# ENV DATABASE_URL=file:/data/sqlite.db
ENV PORT="8080"
ENV NODE_ENV="production"
ENV GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
ENV VAPID_PUBLIC_KEY="BLCUCnxLTQDZE0LHiqRSZOoNiag7GkVocbjxtKq8rl7l1EAhztRN1cMi4JXOqifIoGbAdRuuQ5lO7PT0_kxppLI"
ENV VAPID_PRIVATE_KEY="qUSFWBO_i2-2kVP6vosofgxMVUT_pOG5Vqyn-5aVTrg"


# add shortcut for connecting to database CLI
# RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

WORKDIR /myapp





COPY --from=production-deps /myapp/node_modules /myapp/node_modules
# COPY --from=build /myapp/node_modules/.prisma /myapp/node_modules/.prisma

RUN /bin/bash -c 'source $HOME/.bashrc; echo $HOME'


# Copying fonts to build


COPY --from=build /myapp/build /myapp/build


ADD Gilroy-Bold.ttf Gilroy-Regular.ttf /myapp/
ADD Gilroy-Bold.ttf Gilroy-Regular.ttf /myapp/public/
ADD Gilroy-Bold.ttf Gilroy-Regular.ttf /myapp/build/
ADD Gilroy-Bold.ttf Gilroy-Regular.ttf /myapp/public/build/
ADD GILROY-BLACK.TTF GILROY-MEDIUM.TTF /myapp/
ADD GILROY-BLACK.TTF GILROY-MEDIUM.TTF /myapp/public/
ADD GILROY-BLACK.TTF GILROY-MEDIUM.TTF /myapp/build/
ADD GILROY-BLACK.TTF GILROY-MEDIUM.TTF /myapp/public/build/


COPY --from=build /myapp/public /myapp/public
ADD . .


RUN command
# CMD ["/bin/ls","-v"]


CMD ["npm", "start"]
