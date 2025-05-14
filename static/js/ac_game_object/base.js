// 使界面每一帧都刷新一次，一秒钟刷新60次

// 定义全局数组 将所有游戏对象存入其中  (存储所有AcGameObject类的实例)
let AC_GAME_OBJECTS = [];

class AcGameObject {
    constructor() {
        // this表示调用该方法的具体实例
        AC_GAME_OBJECTS.push(this);

        this.timedelta = 0;   // 用于存储时间增量
        this.has_call_start = false;  // 用于判断是否已经执行过start方法
    }

    start() {  // 初始执行一次

    }

    update() {  // 每一帧执行一次

    }

    destory() {  // 删除当前对象
        for (let i in AC_GAME_OBJECTS) {
            if (AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1);  // 从数组中删除当前对象
                break;
            }
        }
    }
}


//requestAnimationFrame方法 通过递归实现每一帧执行一次
let last_timestamp;  // 记录上一帧的执行时刻
// 创建一个函数
let AC_GAME_OBJECTS_FRAME = (timestamp) => {
    for (let obj of AC_GAME_OBJECTS) {
        if (!obj.has_call_start) {
            obj.start();
            obj.has_call_start = true;
        }
        else {
            obj.timedelta = timestamp - last_timestamp;  // 计算时间增量
            obj.update();
        }
    }

    last_timestamp = timestamp;  // 记录当前帧的执行时刻
    requestAnimationFrame(AC_GAME_OBJECTS_FRAME);  // 递归调用自身，实现每一帧执行一次
}
// 调用requestAnimationFrame方法，开始游戏
requestAnimationFrame(AC_GAME_OBJECTS_FRAME);

export {
    AcGameObject
}