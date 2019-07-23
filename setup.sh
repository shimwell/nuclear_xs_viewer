#sudo docker run -t shimwell:nuclear_xs_viewer_build -v $PWD:/app/build

# docker run -v ${PWD}:/app -v /app/node_modules -p 3001:3000 --rm shimwell:nuclear_xs_viewer
# sudo docker run -it -p 80:80 -rm shimwell:nuclear_xs_viewer

sudo apt --yes install nodejs
sudo apt --yes install npm
export PATH=$PWD/node_modules/.bin:$PATH

export NODE_OPTIONS="--max-old-space-size=2048"
# mkdir app
# cd app

git config --global user.email "mail@jshimwell.com"
git config --global user.name "shimwell"
npm version patch


sudo npm install
sudo npm install react-scripts@3.0.1 -g 
sudo npm install jquery --save
sudo npm install popper.js --save
sudo npm install bootstrap --save
sudo npm install reactstrap react react-dom --save
sudo npm install react-table --save
sudo npm install react-select --save
sudo npm install reactstrap --save
sudo npm install react-plotly.js --save
sudo npm install plotly.js --save
sudo npm install rc-slider --save 

rm -rf node_modules
npm cache clean --force
npm install


npm version patch
npm update
npm run build


# FROM node:12.2.0-alpine as build

# # set working directory
# WORKDIR /app


# # add `/app/node_modules/.bin` to $PATH
# ENV PATH /app/node_modules/.bin:$PATH
# ENV NODE_OPTIONS="–max-old-space-size=2048"

# # install and cache app dependencies
# COPY package.json /app/package.json

# RUN npm version patch



# RUN echo updating app code
# COPY . /app

# RUN npm update
# # RUN npm ls
# RUN npm run build


