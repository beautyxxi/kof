import { Player } from '/static/js/player/base.js';
import { GIF } from '/static/js/utils/gif.js';

export class Kyo extends Player {
    constructor(root, info) {
        super(root, info);

        this.init_animations();
    }

    // 初始化动画
    init_animations() {
        let outer = this;
        let offsets = [0, -22, -22, -140, 0, 0, 0]; // 各个动画的y轴偏移量，因为在行走时会向下移，跳跃也是
        for (let i = 0; i < 7; i++) {
            let gif = GIF();
            gif.load(`/static/images/player/kyo/${i}.gif`);
            this.animations.set(i, {
                gif: gif,
                frame_cnt: 0,   // 总图片数 (总帧数)
                frame_rate: 5,   //每秒刷帧的速率 每5帧过渡一次
                offset_y: offsets[i],   // y轴偏移量 
                loaded: false,   // 是否加载完成
                scale: 2,   // 缩放比例
            });

            gif.onload = function () {
                let obj = outer.animations.get(i);
                obj.frame_cnt = gif.frames.length;
                // console.log(`总帧数: ${obj.frame_cnt}`)
                obj.loaded = true;

                if (i === 3) {     //??
                    obj.frame_rate = 4;
                }

            }
        }
    }
}