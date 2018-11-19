FROM node:10

#Create dedicated user to avoid running the app as root + install npm (fixed version)
RUN useradd --user-group --create-home --shell /bin/false app

#Create directory structure
ENV HOME=/home/app

#Change to the new user
# COPY . /home/app
ADD package.json $HOME/

USER app
WORKDIR $HOME
RUN npm install

CMD ["node", "./bin/www"]
# CMD ["npm", "start"]
