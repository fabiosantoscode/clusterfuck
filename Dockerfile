FROM zzrot/alpine-node

WORKDIR /code

COPY . /code

EXPOSE 3000

CMD ["/code/node_modules/.bin/babel-node", "/code"]

