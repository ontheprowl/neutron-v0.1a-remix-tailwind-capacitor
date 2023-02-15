import type { RedisClientOptions} from 'redis';
import { createClient } from 'redis';



const redisDevConfig : RedisClientOptions = {
        url : `redis://default@127.0.0.1:6379`
}

const redisProdConfig: RedisClientOptions = {
        url:"redis://:c00a6f6de40c413a9413c7df97b78520@fly-cache-flow.upstash.io:6379"
        // host: 'redis-19852.c212.ap-south-1-1.ec2.cloud.redislabs.com',
        // port: 19852,
        // timeout:10000,
        // connectionName:'Neutron Server',
        // password: 'Z7XDim2vS2qvh6VBCqNHMyKoGSY6BLJZ'
}


export const redisServerSide = createClient(process.env.NODE_ENV == "development" ? redisDevConfig : redisProdConfig);
redisServerSide.connect();




