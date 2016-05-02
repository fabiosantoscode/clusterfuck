FROM zzrot/alpine-node

COPY . /code

CMD ["/code/node_modules/.bin/babel-node", "/code"]

