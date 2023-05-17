# pull official base image
FROM python:3.7-alpine AS foundation

# set work directory
WORKDIR /usr/src/app

# set environment varibles
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install psycopg2
RUN apk update \
    && apk add --virtual build-deps gcc python3-dev musl-dev \
    && apk add postgresql-dev \
    && pip install psycopg2-binary==2.8.6 \
    && apk del build-deps

# install dependencies
RUN pip install --upgrade pip
COPY ./requirements.txt /usr/src/app/requirements.txt
RUN pip install -r requirements.txt


FROM foundation AS sourcecode
# copy entrypoint-prod.sh
COPY ./entrypoint.prod.sh /usr/src/app/entrypoint.prod.sh
RUN chmod +x /usr/src/app/entrypoint.prod.sh

# run entrypoint.prod.sh
ENTRYPOINT ["/usr/src/app/entrypoint.prod.sh"]

# copy project
COPY . /usr/src/app/
