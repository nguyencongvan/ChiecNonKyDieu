// Polyfill cho requestAnimationFrame
window.requestAnimationFrame =
window.__requestAnimationFrame ||
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    (function () {
        return function (callback, element) {
            var lastTime = element.__lastTime;
            if (lastTime === undefined) {
                lastTime = 0;
            }
            var currTime = Date.now();
            var timeToCall = Math.max(1, 33 - (currTime - lastTime));
            window.setTimeout(callback, timeToCall);
            element.__lastTime = currTime + timeToCall;
        };
    })();

// Kiểm tra thiết bị di động
window.isDevice = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(((navigator.userAgent || navigator.vendor || window.opera)).toLowerCase()));

// Biến theo dõi trạng thái loaded
var loaded = false;

// Tạo và load ảnh nền
var bgImage = new Image();
bgImage.src = 'https://scontent.fhan12-1.fna.fbcdn.net/v/t39.30808-6/424571925_1980721598995461_3418928664321161477_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=127cfc&_nc_ohc=-OmzQhboRp8Q7kNvgFy0war&_nc_oc=AdibiRaaFAhLQR3mTFuhHQsw_QtyECPPsedaP9EuXTh4VzeWKZHzdZCs7mYf2zjIY5o&_nc_zt=23&_nc_ht=scontent.fhan12-1.fna&_nc_gid=AoUja9n9C27tb7oxLfJWEQI&oh=00_AYCWrPjgnckfBB42t6ppSwe58WO2Z0BKev-7NjHBN_0ljA&oe=67705895'; // Thay thế bằng URL ảnh của bạn
var imageLoaded = false;
bgImage.onload = function() {
    imageLoaded = true;
};

// Hàm vẽ ảnh giữ nguyên tỷ lệ và căn giữa
function drawImageProp(ctx, img, dx, dy, dWidth, dHeight) {
    let imgWidth = img.naturalWidth;
    let imgHeight = img.naturalHeight;
    let offsetX = (dWidth - imgWidth) * 0.5;
    let offsetY = (dHeight - imgHeight) * 0.4;
    ctx.drawImage(img, offsetX, offsetY, imgWidth, imgHeight);
}

// Hàm khởi tạo chính
var init = function () {
    if (loaded) return;
    loaded = true;

    // Thiết lập canvas
    var canvas = document.getElementById('heart');
    var ctx = canvas.getContext('2d');
    var width = canvas.width = 2000;
    var height = canvas.height = 1200;
    var rand = Math.random;

    // Canvas cho background
    var bgCanvas = document.createElement('canvas');
    var bgCtx = bgCanvas.getContext('2d');
    bgCanvas.width = width;
    bgCanvas.height = height;

    // Vẽ background ban đầu
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, width, height);

    // Hàm tính toán vị trí trái tim
    var heartPosition = function (rad) {
        return [Math.pow(Math.sin(rad), 3), 
            -(15 * Math.cos(rad) - 5 * 
            Math.cos(2 * rad) - 2 * 
            Math.cos(3 * rad) - Math.cos(4 * rad))];
    };

    // Hàm scale và dịch chuyển điểm
    var scaleAndTranslate = function (pos, sx, sy, dx, dy) {
        return [dx + pos[0] * sx, dy + pos[1] * sy];
    };

    // Khởi tạo các điểm của trái tim
    var traceCount = 30;
    var pointsOrigin = [];
    var i;
    var dr = 0.1;

    // Tạo 3 lớp điểm cho trái tim
    for (i = 0; i < Math.PI * 2; i += dr) 
        pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90, 5, 0, 0));
    for (i = 0; i < Math.PI * 2; i += dr) 
        pointsOrigin.push(scaleAndTranslate(heartPosition(i), 70, 4, 0, 0));
    for (i = 0; i < Math.PI * 2; i += dr) 
        pointsOrigin.push(scaleAndTranslate(heartPosition(i), 50, 3, 0, 0));

    var heartPointsCount = pointsOrigin.length;

    // Hàm tạo xung
    var targetPoints = [];
    var pulse = function (kx, ky) {
        for (i = 0; i < pointsOrigin.length; i++) {
            targetPoints[i] = [];
            targetPoints[i][0] = kx * pointsOrigin[i][0] + width / 2;
            targetPoints[i][1] = ky * pointsOrigin[i][1] + height / 2;
        }
    };

    // Khởi tạo các hạt
    var e = [];
    for (i = 0; i < heartPointsCount; i++) {
        var x = rand() * width;
        var y = rand() * height;
        e[i] = {
            vx: 0,
            vy: 0,
            R: 2,
            speed: rand() + 5,
            q: ~~(rand() * heartPointsCount),
            D: 2 * (i % 2) - 1,
            force: 0.2 * rand() + 0.7,
            f: "hsla(0," + ~~(40 * rand() + 60) + "%," + ~~(60 * rand() + 20) + "%,.3)",
            trace: []
        };
        for (var k = 0; k < traceCount; k++) e[i].trace[k] = {x: x, y: y};
    }

    // Cấu hình animation
    var config = {
        traceK: 0.4,
        timeDelta: 0.01
    };

    // Tạo sparkles
    var sparkles = [];
    var sparkleColors = ['#FFD700', '#FF69B4', '#FF1493', '#FFA500', '#FF69B4'];

    function createSparkle() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 3 + 1,
            color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
            life: 1,
            decay: Math.random() * 0.02 + 0.02
        };
    }

    // Loop animation chính
    var time = 0;
    var loop = function () {
        var n = -Math.cos(time);
        pulse((1 + n) * .5, (1 + n) * .5);
        time += ((Math.sin(time)) < 0 ? 9 : (n > 0.8) ? .2 : 1) * config.timeDelta;

        // Vẽ background
        if (imageLoaded) {
            bgCtx.clearRect(0, 0, width, height);
            bgCtx.globalAlpha = 0.3;
            drawImageProp(bgCtx, bgImage, 0, 0, width, height);
            bgCtx.fillStyle = `rgba(255, 255, 255, ${Math.abs(Math.sin(time/2)) * 0.1})`;
            bgCtx.fillRect(0, 0, width, height);
        }

        // Copy background vào canvas chính
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(bgCanvas, 0, 0);
        
        ctx.fillStyle = "rgba(0,0,0,.1)";
        ctx.fillRect(0, 0, width, height);

        // Vẽ các hạt trái tim
        ctx.globalCompositeOperation = 'lighter';

        for (i = e.length; i--;) {
            var u = e[i];
            var q = targetPoints[u.q];
            var dx = u.trace[0].x - q[0];
            var dy = u.trace[0].y - q[1];
            var length = Math.sqrt(dx * dx + dy * dy);

            if (10 > length) {
                if (0.95 < rand()) {
                    u.q = ~~(rand() * heartPointsCount);
                } else {
                    if (0.99 < rand()) {
                        u.D *= -1;
                    }
                    u.q += u.D;
                    u.q %= heartPointsCount;
                    if (0 > u.q) {
                        u.q += heartPointsCount;
                    }
                }
            }

            u.vx += -dx / length * u.speed;
            u.vy += -dy / length * u.speed;
            u.trace[0].x += u.vx;
            u.trace[0].y += u.vy;
            u.vx *= u.force;
            u.vy *= u.force;

            for (k = 0; k < u.trace.length - 1;) {
                var T = u.trace[k];
                var N = u.trace[++k];
                N.x -= config.traceK * (N.x - T.x);
                N.y -= config.traceK * (N.y - T.y);
            }

            ctx.fillStyle = u.f;
            for (k = 0; k < u.trace.length; k++) {
                ctx.fillRect(u.trace[k].x, u.trace[k].y, 1, 1);
            }
        }

        // Thêm sparkles
        if (Math.random() < 0.1) {
            sparkles.push(createSparkle());
        }

        sparkles = sparkles.filter(s => {
            s.life -= s.decay;
            if (s.life <= 0) return false;
            
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
            ctx.fillStyle = s.color;
            ctx.fill();
            return true;
        });

        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';

        // Vẽ text "ViVi"
        var fontSize = 32;
        ctx.font = fontSize + "px 'Dancing Script', cursive";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Thêm hiệu ứng glow
        ctx.shadowColor = "rgba(255, 192, 203, 0.8)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Thêm hiệu ứng bounce
        var bounce = Math.sin(time * 2) * 3;
        
        // Vẽ viền text
        ctx.strokeStyle = "rgba(255, 182, 193, 0.9)";
        ctx.lineWidth = 2;
        ctx.strokeText("ViVi", width / 2, height / 2 + bounce);
        
        // Vẽ text chính
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillText("ViVi", width / 2, height / 2 + bounce);
        
        // Reset shadow
        ctx.shadowBlur = 0;

        window.requestAnimationFrame(loop, canvas);
    };

    loop();
};

// Khởi chạy khi trang đã sẵn sàng
var s = document.readyState;
if (s === 'complete' || s === 'loaded' || s === 'interactive') init();
else document.addEventListener('DOMContentLoaded', init, false);
