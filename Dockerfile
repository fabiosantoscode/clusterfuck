FROM zzrot/alpine-node

WORKDIR /code

# Use layers to push just the code and not the node_modules folder when it's unchanged.
COPY ./node_modules /code/node_modules

COPY . /code

EXPOSE 3000

CMD ["/code/node_modules/.bin/babel-node", "/code"]

