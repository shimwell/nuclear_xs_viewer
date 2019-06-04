# base image
FROM node:12.2.0-alpine

# sudo docker build -t sample:dev .

# docker run -v ${PWD}:/app -v /app/node_modules -p 3001:3000 --rm sample:dev

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json
# RUN npm install
RUN npm install react-scripts@3.0.1 -g 


RUN npm install jquery --save
RUN npm install popper.js --save
RUN npm install bootstrap --save
RUN npm install reactstrap react react-dom --save
RUN npm install react-table --save
RUN npm install react-select --save
RUN npm install reactstrap --save
RUN npm install react-plotly.js --save
RUN npm install plotly.js --save
RUN npm install rc-slider --save 

# start app
CMD ["npm", "start"]
