FROM postgres:latest

ENV POSTGRES_USER=user
ENV POSTGRES_PASSWORD=password
ENV POSTGRES_DB=solink

COPY sql/schema.sql /docker-entrypoint-initdb.d/