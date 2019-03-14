FROM daocloud.io/library/redis:3.2.4
COPY ./docker/redis/redis.conf /etc/redis.conf
EXPOSE 6379
CMD ["/usr/local/bin/redis-server", "/etc/redis.conf"]
