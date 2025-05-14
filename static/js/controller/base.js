// 读取键盘输入

export class Controller {
    constructor($canvas) {
        this.$canvas = $canvas;

        this.pressed_keys = new Set();  //记录当前按住了哪些键
        this.start();
    }

    start() {
        // 函数里的this不是外面的this，如果想用外面的this，要用变量存下来
        let outer = this;
        this.$canvas.keydown(function (e) {
            outer.pressed_keys.add(e.key);
            // console.log(outer.pressed_keys);
            // console.log(e.key);
        });

        this.$canvas.keyup(function (e) {
            outer.pressed_keys.delete(e.key);
        })
    }
}