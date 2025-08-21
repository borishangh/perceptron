const info_div = document.getElementById("info");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

const dpr = window.devicePixelRatio || 1;
const rect = canvas.getBoundingClientRect();

const SIZE = Math.min(500, 0.85 * window.innerWidth);
canvas.height = ~~(SIZE * dpr);
canvas.width = ~~(SIZE * dpr);
canvas.style.height = `${SIZE}px`;
canvas.style.width = `${SIZE}px`;
console.log(`dpr : ${dpr}`);


function drawDot(x, y, d = 0, border = false) {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    if (d == 1) ctx.fillStyle = "red";
    else if (d == -1) ctx.fillStyle = "blue";
    else ctx.fillStyle = "grey";
    ctx.fill();

    if (border) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    ctx.closePath();
}

function drawLine(x0, y0, x1, y1, dashed = false) {
    if (dashed) ctx.setLineDash([5, 3]);
    else ctx.setLineDash([])

    ctx.lineWidth = 1;
    ctx.strokeStyle = dashed ? "grey" : "black";
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
}

const topx = (x) => (x + 1) * 0.5 * SIZE * dpr

function randomPoints(n, w) {
    return Array.from({ length: n }, () => {
        let x = Math.random() * 2 - 1;
        let y = Math.random() * 2 - 1;
        let d = w.w0 + w.w1 * x + w.w2 * y > 0 ? 1 : -1;

        return { x: x, y: y, d: d };
    })
}

function drawPoints(points) {
    for (const point of points) {
        drawDot(topx(point.x), topx(point.y), d = point.d)
    }
}

const drawDecisionBoundary = (w_pred, dashed = false) => {
    let y0 = (w_pred.w1 / w_pred.w2) - (w_pred.w0 / w_pred.w2)
    let y1 = -(w_pred.w1 / w_pred.w2) - (w_pred.w0 / w_pred.w2)

    drawLine(topx(-1), topx(y0), topx(1), topx(y1), dashed)
}

function perceptronUpdate(point, w_pred, r = 0.05) {
    const pred = w_pred.w0 + w_pred.w1 * point.x + w_pred.w2 * point.y > 0 ? 1 : -1;

    const z0 = w_pred.w0 + r * (point.d - pred);
    const z1 = w_pred.w1 + r * (point.d - pred) * point.x;
    const z2 = w_pred.w2 + r * (point.d - pred) * point.y;

    return { w0: z0, w1: z1, w2: z2 };
}

function accuracy(points, w_pred) {
    let correct = 0;
    for (const point of points) {
        const pred = w_pred.w0 + w_pred.w1 * point.x + w_pred.w2 * point.y > 0 ? 1 : -1;
        if (pred == point.d) correct++;
    } return (correct * 100 / points.length).toFixed(2);
}


const w = { w0: 0, w1: Math.random() * 2, w2: Math.random() * 2 }
const points = randomPoints(70, w)

let w_pred = { w0: 0, w1: 0, w2: 1 };

drawPoints(points)

drawDecisionBoundary(w, dashed = true) // actual

drawDecisionBoundary(w_pred)

let epoch = 0;
info_div.innerHTML = `epoch = ${epoch}, accuracy = ${accuracy(points, w_pred)}%`

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function animateUpdate(t = 1) {
    const wait = t * 1000 / points.length;

    for (const point of points) {
        ctx.clearRect(0, 0, SIZE * dpr, SIZE * dpr)
        drawPoints(points)
        drawDot(topx(point.x), topx(point.y), d = point.d, border = true);

        drawDecisionBoundary(w, dashed = true) // actual

        w_pred = perceptronUpdate(point, w_pred)
        drawDecisionBoundary(w_pred)
        await sleep(wait);
        info_div.innerHTML = `epoch = ${epoch}, accuracy = ${accuracy(points, w_pred)}%`
    }

    epoch++;
    info_div.innerHTML = `epoch = ${epoch}, accuracy = ${accuracy(points, w_pred)}%`
    if (accuracy(points, w_pred) == 100) {
        info_div.innerHTML += ` already converged!`
    }
}