# base image
FROM node:12.2.0-stretch as build

# sudo docker build -t shimwell:nuclear_xs_viewer .

# docker run -p 80:80 shimwell:nuclear_xs_viewer

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH
ENV NODE_OPTIONS="–max-old-space-size=2048"

# install and cache app dependencies
COPY package.json /app/package.json

RUN npm version patch

RUN npm install
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
RUN npm install dotenv --save
RUN npm install react-ga --save
RUN apt-get update
RUN apt-get install dnsutils --yes

RUN npm update

RUN echo updating app 13234567891
COPY . /app


# this ip address should come from the docker-compose file
# currently it is hard coded here but this is not ideal
RUN echo "this is the value of REACT_APP_ENDPOINT $REACT_APP_ENDPOINT which is suppose to be pass by the docker-compose but not working"
# as the REACT_APP_ENDPOINT value stated in docker-compose has not got through to this docker image, the REACT_APP_ENDPOINT is now defined below
ENV REACT_APP_ENDPOINT="http://34.77.71.230:8080"
RUN echo "this is the new value of REACT_APP_ENDPOINT $REACT_APP_ENDPOINT which is used in App.js"

RUN npm run build

# start app
# CMD ["npm", "start"]

FROM nginx:1.16.0-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
