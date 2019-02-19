/**
 * 将实体组中infoArray中所提及的设为可见并根据infoArray中的信息进行状态更新，未提及的设为不可见
 * @param {Array<_Entity>} entityArray 实体组，比如所有hero，所有道具等等  
 * @param {Array<object>} infoArray 每个元素都有id键值，表示需要显示编号为id的元素
 */

function updateByID(entityArray, infoArray) {
    let n = entityArray.length;
    let isIn = new Array(n);
    for (let i=0; i<n; i++)
        isIn[i] = false;
    for (let i in infoArray) {
        let id = infoArray[i].id;
        isIn[id] = true;
        if (entityArray[id] === undefined)
            continue;
        entityArray[id].update(infoArray[i]);
    }
    for (let i in isIn) {
        if (entityArray[i] === undefined)
            continue;
        entityArray[i].visible = isIn[i];
    }
}

/**
 * 在不保证entityArray中编号0-n-1时使用，entityArray与infoArray中的元素都有id键值
 * @param {Array<_Entity>} entityArray 
 * @param {Array<object>} infoArray 
 */

function updateByIdDict(entityArray, infoArray) {
    let position = {};
    for (let i in infoArray)
        position[infoArray[i].id] = i;
    for (let i in entityArray) {
        if (position[entityArray[i].id] === undefined)
            entityArray[i].visible = false;
        else {
            entityArray[i].update(infoArray[position[entityArray[i].id]]);
            entityArray[i].visible = true;
        }
    }
}

// /**
//  * 根据infoArray的信息更新entity。如果entity在infoArray中，显示其并更新之，否则隐藏之
//  * @param {_Entity} entity 待更新实体
//  * @param {number} id 待更新实体的编号
//  * @param {Array<object>} infoArray 每个元素都有id键值，表示需要显示编号为id的元素
//  */
// function updateSingleEntity(entity, id, infoArray) {
//     let data = undefined;
//     for (let i in infoArray)
//         if (infoArray[i].id == id) {
//             data = infoArray[i];
//             break;
//         }
//     if (data === undefined) {
//         entity.visible = false;
//         return;
//     }
//     entity.visible = true;
//     entity.update(data);
// }

export {updateByID, updateByIdDict};