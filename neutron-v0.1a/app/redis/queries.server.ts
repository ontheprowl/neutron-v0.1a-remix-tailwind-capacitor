import { redisServerSide } from "./redis-config.server";

// * 


export async function isAlive() : Promise<boolean>{

    return (await redisServerSide.ping()) === "PONG";
}

export async function cacheObject(key:string, object : Object) : Promise<boolean> {
    console.log("being cached to redis")
    return (await redisServerSide.json.set(key,`$`,object)) === "OK";
}

export async function hasKey(key:string) : Promise<boolean> {
    return (await redisServerSide.exists(key)) === 1
}

export async function retrieveObject(key:string) : Promise<Object> {

    // const fieldKeys = await redisServerSide.json(key);
    const fieldValues = await redisServerSide.json.get(key,{path:'$'});
    const retrievedObject: { [x:string] : any} = fieldValues[0]

    // for (let i = 0; i< fieldKeys.length; i++ ) {
    //     if(fieldValues)
    //     retrievedObject[fieldKeys[i]]=fieldValues[i]
    // }
    return retrievedObject
}