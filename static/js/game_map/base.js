// 地图 GameMap

// 用到其他地方定义的对象，需要先导入
import { AcGameObject } from '/static/js/ac_game_object/base.js'
import { Controller } from '/static/js/controller/base.js'

// 继承
class GameMap extends AcGameObject {
    //kof类是当作root参数传入的
    constructor(root) {
        super();

        this.root = root;

        // 让canvas可以聚焦 tabindex=0  jQuery里的canvas是一个数组
        //$canvas 是一个 jQuery 包装对象，包含许多 jQuery 方法
        let $canvas = $('<canvas width="1280" height="720" tabindex="0"></canvas>');
        this.$canvas = $canvas;
        // console.log(this.$canvas)

        //this.ctx 是 CanvasRenderingContext2D 对象,canvas的操作都是通过ctx
        this.ctx = $canvas[0].getContext('2d');

        this.root.$kof.append(this.$canvas);
        this.$canvas.focus();   //聚焦 接受键盘输入

        this.controller = new Controller(this.$canvas);

        //时间
        this.time_left = 60000;  // 毫秒
        this.$timer = this.root.$kof.find('.kof-head-timer');

    }

    start() {

    }

    update() {
        this.time_left -= this.timedelta;  // 每秒减1000毫秒
        if (this.time_left < 0) {
            this.time_left = 0;

            let [a, b] = this.root.players;
            if (a.status !== 6 && b.status !== 6) {
                a.status = b.status = 6;  // 都输了
                a.frame_current_cnt = b.frame_current_cnt = 0;  // 重置帧数

                a.vx = b.vx = 0;  // 停止移动
            }
        }
        this.$timer.text(parseInt(this.time_left / 1000));  // 显示剩余时间

        this.render();  // 在外面定义，在update里调用
    }

    // 需要将每一帧进行清空画布
    render() {

        // ctx 是 CanvasRenderingContext2D 对象，它有一个 canvas 属性，指向绘图上下文所关联的 <canvas> 元素。
        //获取canvas宽高：（1）this.ctx.canvas.width （2）this.$canvas.width()
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        // console.log(this.ctx.canvas.width, this.ctx.canvas.height);

        // 画布渲染黑色 （方便设计）
        // this.ctx.fillStyle = 'black';
        // this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}

export {
    GameMap
}