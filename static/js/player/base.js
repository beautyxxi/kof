// 人物 player

import { AcGameObject } from '/static/js/ac_game_object/base.js';


export class Player extends AcGameObject {
    // root 方便索引整个地图上的对象，info 存储了该对象的基本信息
    constructor(root, info) {
        super();

        this.root = root;
        this.id = info.id;  // 区别两个角色
        this.x = info.x;
        this.y = info.y;
        this.width = info.width;
        this.height = info.height;
        this.color = info.color;

        this.direction = 1;  // 1 正方向，-1 反方向
        this.status = 3;   // 0: idle，1: 向前，2: 向后，3: 跳跃，4：攻击，5：被打，6：死亡

        this.vx = 0;  // 横纵速度（矩形块移动速度，先用矩形块表示角色）
        this.vy = 0;

        this.speedx = 400;  // 水平速度（角色移动速度）
        this.speedy = -1000;  // 跳起的初始速度

        this.gravity = 50;  // 重力加速度

        this.ctx = this.root.game_map.ctx;
        this.pressed_keys = this.root.game_map.controller.pressed_keys;

        //将每个状态的动作存入数组里
        this.animations = new Map();
        this.frame_current_cnt = 0;  //当前记录了多少帧

        //定义血量
        this.hp = 100;
        // 血槽
        this.$hp = this.root.$kof.find(`.kof-head-hp-${this.id}>div`);
        this.$hp_div = this.$hp.find('div');
    }

    start() {

    }

    update_move() {
        // if (this.status === 3  || this.status === 4) {   //在空中时增加重力
        this.vy = this.vy + this.gravity;  // 加速度
        // }
        // this.vy = this.vy + this.gravity;  // 加速度

        this.x = this.x + this.vx * this.timedelta / 1000;  // 移动
        this.y = this.y + this.vy * this.timedelta / 1000;

        if (this.y > 450) {  // 限制角色在地图范围内
            this.y = 450;
            this.vy = 0;

            if (this.status === 3) this.status = 0;
        }

        if (this.x < 0) {
            this.x = 0;
        }
        else if (this.x + this.width > this.root.game_map.$canvas.width()) {
            this.x = this.root.game_map.$canvas.width() - this.width;
        }
    }

    update_control() {
        let w, a, d, space;
        if (this.id === 0) {
            w = this.pressed_keys.has('w');
            a = this.pressed_keys.has('a');
            d = this.pressed_keys.has('d');
            space = this.pressed_keys.has(' ');
        }
        else {
            w = this.pressed_keys.has('ArrowUp');
            a = this.pressed_keys.has('ArrowLeft');
            d = this.pressed_keys.has('ArrowRight');
            space = this.pressed_keys.has('Enter');
        }

        // console.log(this.pressed_keys);

        //如果当前在静止状态或者移动状态
        if (this.status === 0 || this.status === 1) {


            if (space) {
                this.status = 4;  // 攻击状态
                this.vx = 0;
                this.frame_current_cnt = 0;  // 重置帧数，从第0帧开始渲染 攻击是一个连贯的动画，从中间动画开始会很奇怪
            }

            // 跳跃有三种方式 垂直跳，斜前跳，斜后跳
            else if (w) {
                if (d) {  // 斜前跳
                    this.vx = this.speedx;
                }
                else if (a) {  // 斜后跳
                    this.vx = -this.speedx;
                }
                else {  // 垂直跳
                    this.vx = 0;
                }
                this.vy = this.speedy;
                this.status = 3;
                this.frame_current_cnt = 0;  // 重置帧数 攻击是一个连贯的动画，从中间动画开始会很奇怪
            }
            else if (d) {   //向前移动
                this.vx = this.speedx;
                this.status = 1;
            }
            else if (a) {  //向后移动
                this.vx = -this.speedx;
                this.status = 1;
            }
            else {   // 静止状态
                this.vx = 0;
                this.status = 0;
            }
            // if (this.id === 0) {
            //     console.log(this.status);
            // }
        }
    }

    update_direction() {  //人物对称
        if (this.status === 6) return;  //死亡状态不再改变方向
        let players = this.root.players;   //将玩家取出
        if (players[0] && players[1]) {
            let me = this, you = players[1 - this.id];
            if (me.x < you.x) {
                me.direction = 1;
            }
            else {
                me.direction = -1;
            }
        }
    }

    // 判断是否被攻击到
    is_attack() {
        if (this.status === 6) return;  //死亡状态不再受伤

        this.status = 5;  // 被攻击状态
        this.frame_current_cnt = 0;  // 重置帧数

        this.hp = Math.max(this.hp - 10, 0);  // 扣血

        //掉血渐变
        this.$hp_div.animate({
            width: this.$hp.parent().width() * this.hp / 100
        }, 300)
        this.$hp.animate({
            width: this.$hp.parent().width() * this.hp / 100
        }, 600)
        // 掉血的时候改变血槽长度
        // this.$hp.width(this.$hp.parent().width() * this.hp / 100);

        if (this.hp <= 0) {
            this.status = 6;  // 死亡状态
            this.frame_current_cnt = 0;  // 重置帧数
            this.vx = 0;
        }
    }

    //碰撞检测，判断两个矩形是否有交集（水平竖直都有交集）
    is_collision(r1, r2) {
        if (Math.max(r1.x1, r2.x1) > Math.min(r1.x2, r2.x2))     //左端点>右端点
            return false;
        if (Math.max(r1.y1, r2.y1) > Math.min(r1.y2, r2.y2))    //下端点>上端点
            return false;
        return true;
    }

    update_attack() {
        if (this.status === 4 && this.frame_current_cnt === 18) {  //拳头挥出一半，认为攻击到
            // this.status = 0;  // 测试挥拳攻击

            let me = this, you = this.root.players[1 - this.id];
            let r1;
            if (this.direction > 0) {
                r1 = {
                    x1: me.x + 120,
                    y1: me.y + 45,
                    x2: me.x + 120 + 105,
                    y2: me.y + 45 + 15,
                };
            }
            else {
                r1 = {
                    x1: me.x + me.width - 120 - 105,
                    y1: me.y + 45,
                    x2: me.x + me.width - 120 - 105 + 105,
                    y2: me.y + 45 + 15,
                };
            }

            let r2 = {
                x1: you.x,
                y1: you.y,
                x2: you.x + you.width,
                y2: you.y + you.height,
            };

            if (this.is_collision(r1, r2)) {
                you.is_attack();
            }
        }
    }

    update() {

        this.update_control();  //每一帧都要调用，判断输入的是什么
        this.update_move();
        this.update_direction();
        this.update_attack();

        this.render();
    }

    render() {  //render() 是一个方法，必须定义在类中
        //渲染矩形(方便前期开发)
        // this.ctx.fillStyle = this.color;
        // this.ctx.fillRect(this.x, this.y, this.width, this.height);

        //渲染角色方框和拳头方框（方便开发）
        // this.ctx.fillStyle = "blue";
        // this.ctx.fillRect(this.x, this.y, this.width, this.height);

        // if (this.direction > 0) {   //判断位置，拳头是相对的
        //     this.ctx.fillStyle = "red";
        //     this.ctx.fillRect(this.x + 120, this.y + 45, 105, 15);
        // }
        // else {
        //     this.ctx.fillStyle = "red";
        //     this.ctx.fillRect(this.x + this.width - 120 - 105, this.y + 45, 105, 15);
        // }



        // if (this.id === 1) {
        //     console.log(this.status);
        // }


        let status = this.status;   //根据当前的status来渲染不同的动画

        if (this.status === 1 && this.direction * this.vx < 0) status = 2;  //每一帧都会重新判断是否为后退，所以不必考虑上面主函数不在判断条件里，导致一直后退的情况

        // 调试为什么前后移动状态不变
        // console.log(`status: ${status}`);
        // let m = this.vx * this.direction;
        // if (this.id === 0) {
        //     console.log(`速度是：${m}`)
        // }

        let obj = this.animations.get(status);
        // console.log(`obj: ${obj}`);
        // console.log(this.animations);
        // if (obj && obj.loaded) {
        //     console.log(obj.gif); // 检查 gif 对象
        //     console.log(obj.gif.frames); // 检查 frames 数组
        // }
        if (obj && obj.loaded) {

            if (this.direction > 0) {  // 正方向
                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;   //循环渲染,看渲染到哪一帧
                // console.log(`k: ${k}`);
                // console.log("Frame counter:", this.frame_current_cnt);

                let image = obj.gif.frames[k].image;
                // console.log(image);
                this.ctx.drawImage(image, this.x, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);
            }
            else {    // 反方向 （canvas图片水平翻转，翻转坐标系）
                this.ctx.save();  //保存配置
                this.ctx.scale(-1, 1)   //x乘-1，y不变，实现水平翻转
                this.ctx.translate(-this.root.game_map.$canvas.width(), 0)

                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;   //循环渲染,看渲染到哪一帧
                let image = obj.gif.frames[k].image;
                this.ctx.drawImage(image, this.root.game_map.$canvas.width() - this.x - this.width, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);

                this.ctx.restore();  // 恢复配置
            }

        }

        if (status === 4 || status === 5 || status === 6) {  //攻击后要停下来，进行特判  被攻击也需要？？
            if (this.frame_current_cnt === obj.frame_rate * (obj.frame_cnt - 1)) {  //检查是否完成一次攻击动画
                if (status === 6) {
                    this.frame_current_cnt--; // 死亡动画最后一帧不停留，需要减一帧
                }
                else {
                    this.status = 0;  // 攻击结束
                }
            }
        }

        this.frame_current_cnt++;  // 一帧加一次,每一秒显示60帧,需减速
    }


}
