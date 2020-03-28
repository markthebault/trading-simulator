FROM node:10
ARG WORKSPACE=/app
ARG USER=app
ARG USER_UGID=1001

#init
RUN mkdir $WORKSPACE 

# Best practice to run the container as a user instead of root
RUN addgroup --gid $USER_UGID $USER && \
    adduser \
        --disabled-password \
        --home /home/$USER \
        --gecos "" \
        --no-create-home \
        --ingroup $USER \
        --uid $USER_UGID \
        $USER

#Copy content
COPY . ${WORKSPACE}/

#change workdir
WORKDIR $WORKSPACE

# Run the install and the build of the app
RUN npm install && \
    npm run-script build

#Run app as user
RUN chown -R ${USER_UGID}:${USER_UGID} /app
USER $USER


EXPOSE 3000

CMD  ["npm", "run-script", "start"]