FROM zzrot/alpine-node

WORKDIR /code

COPY . /code

EXPOSE 3000

RUN /code/node_modules/.bin/babel-node ./scripts/updateSchema.js

CMD ["/code/node_modules/.bin/babel-node", "/code"]

