#!/bin/bash

#启动redis镜像
#sudo docker rm -f mooncake-redis > /dev/null

# 构建redis镜像
#echo -e "\nbuild mooncake/redis image..."
#sudo docker build -f docker/redis/Dockerfile -t mooncake/redis .

# 启动redis容器
#sudo docker run --net=host -d --volume /data/mooncake/redis/data:/data --name mooncake-redis mooncake/redis > /dev/null


# 启动MongoDB容器
#sudo docker rm -f mooncake-mongo > /dev/null
#echo -e "\nstart mongodb container..."
#sudo docker run --net=host -d --volume /data/mooncake/mongodb/data:/data/db --name mooncake-mongo daocloud.io/library/mongo:3.2 --replSet "rs0" > /dev/null



# 构建镜像
echo -e "\nbuild mooncake/mooncake-sign image..."
sudo docker build -t mooncake/mooncake-sign .


# 运行容器
sudo docker rm -f mooncake-sign > /dev/null
echo -e "\nstart mooncake-sign container..."
sudo docker run -d \
                --restart=always \
                --net=host \
                --name=mooncake-sign \
                -e "NODE_ENV=development" \
                -e "MONGO_HOST=localhost" \
                mooncake/mooncake-sign > /dev/null

echo ""
