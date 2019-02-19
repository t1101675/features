//简单的等待函数，用法：await sleep(ms);
let sleep = time => new Promise(resolve => setTimeout(resolve, time));

//深度复制
let deepCopy = (sourceObj)=>{ return JSON.parse(JSON.stringify(sourceObj)); }

//注意只深度拷贝第一层
let mergeObject = (obj1, obj2) => {
    let ret = deepCopy(obj1);
    for (let i in obj2)
        ret[i] = obj2[i];
    return ret;
}

export {sleep, deepCopy, mergeObject};