$(function() {
    'use strict';
    const canvas = $('#canvas')[0];
    const canvas2 = $('#canvas2')[0];
    const colorPicker = $('#color-picker');
    const ctx = canvas.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    const width = canvas.width;
    let canvasSize;
    let dotSize;
    let undoStack = [];
    let redoStack = [];
    const values = [16, 24, 32, 48, 64, 96, 128];
    let color = [0, 0, 0];
    let isDrawing = false;

    // キャンバスの初期化
    initCanvas()

    function initCanvas() {
        for (let v of values) {
            $(`input[value="${v}×${v}"]`)[0].onclick = () => {
                canvasSize = v;
                dotSize = width / canvasSize;
                $('.new')[0].style.display = 'none';
                $('.cover')[0].style.display = 'none';
                grid();
            }
        }
        clearCanvas();
    }

    function clearCanvas() {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillRect(0, 0, width, width);
        ctx.globalCompositeOperation = "source-over";
    }

    function grid() {
        for (let i = 1; i < canvasSize; i++) {
            ctx2.beginPath();
            let xy = i * dotSize;
            ctx2.moveTo(xy, 0);
            ctx2.lineTo(xy, width);
            ctx2.stroke();
            ctx2.beginPath();
            ctx2.moveTo(0, xy);
            ctx2.lineTo(width, xy);
            ctx2.stroke();
        }
    }

    const pencil = $('.fa-pencil-alt')[0];
    const drip = $('.fa-fill-drip')[0];
    let isDrip = false;

    pencil.onclick = () => {
        drip.style.display = 'block';
        pencil.style.display = 'none';
        isDrip = true;
    }
    drip.onclick = () => {
        pencil.style.display = 'block';
        drip.style.display = 'none';
        isDrip = false;
    }

    // キャンバス部分をクリックされた際の処理
    canvas.addEventListener("click", function(event) {
        drawFunc(event);
    });

    canvas.addEventListener("mousedown", function(event) {
        recordUndoImage();
        isDrawing = true;
    });

    canvas.addEventListener("mouseup", function(event) {
        redoStack = [];
        isDrawing = false
    });

    canvas.addEventListener("mousemove", function(event) {
        if (isDrawing) {
            drawFunc(event);
        }
    });

    function drawFunc(event) {
        const rect = event.target.getBoundingClientRect()
        let x = Math.round(event.clientX - rect.left);
        let y = Math.round(event.clientY - rect.top);
        if (isDrip) { // 塗りつぶし（バケツ）
            drip_(x, y);
        } else { // 1マス塗り
            singlePaint(x, y);
        }
    }

    // 塗りつぶし
    function drip_(x, y) {
        let matrix = [];
        const data = ctx.getImageData(0, 0, width, width).data;
        for (let i = 0; i < Math.ceil(data.length / 4); i++) {
            const start = i * 4;
            const point = data.slice(start, start + 4);
            matrix.push(`${point[0]},${point[1]},${point[2]},${point[3]}`);
        }
        matrix = chunk(matrix, width);
        const floodFillCanvas = new FloodFillCanvas(matrix);
        floodFillCanvas.replaceColor = `${color[0]},${color[1]},${color[2]},255`;
        const table = floodFillCanvas.fill(x, y);
        const imageData = ctx.getImageData(0, 0, width, width);
        table.forEach((row, y) => {
            row.forEach((col, x) => {
                const pos = floodFillCanvas.startPosition(x, y);
                if (table[y][x] === `${color[0]},${color[1]},${color[2]},255`) {
                    imageData.data[pos] = color[0];
                    imageData.data[pos + 1] = color[1];
                    imageData.data[pos + 2] = color[2];
                    imageData.data[pos + 3] = 255;
                }
            })
        })
        ctx.putImageData(imageData, 0, 0)
    }

    // 1マス塗り
    function singlePaint(x, y) {
        ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},1)`;
        ctx.fillRect(x - x % dotSize, y - y % dotSize, dotSize, dotSize);
    }

    // カラーピッカー
    function hexTorgb(hex) {
        return ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0];
    }

    colorPicker.on("change", watchColorPicker);

    function watchColorPicker(event) {
        color = hexTorgb(event.target.value);
    }

    // 新規
    $('#init')[0].onclick = () => {
        let result = window.confirm("キャンバスを新規で作り直しますか？");
        if (result) {
            ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
            ctx2.clearRect(0, 0, ctx2.canvas.clientWidth, ctx2.canvas.clientHeight);
            $('.new')[0].style.display = 'flex';
            $('.cover')[0].style.display = 'flex';
            initCanvas();
        }
    }

    // キャンバスをクリア
    $('#clear')[0].onclick = () => {
        let result = window.confirm("キャンバスをクリアしますか？");
        if (result) {
            clearCanvas();
        }
    }

    // undo redo
    $('.fa-reply')[0].onclick = () => {
        if (undoStack.length != 0) {
            const imageData = undoStack.pop();
            recordRedoImage();
            ctx.putImageData(imageData, 0, 0);
        }
    }
    $('.fa-share')[0].onclick = () => {
        if (redoStack.length != 0) {
            const imageData = redoStack.pop();
            recordUndoImage();
            ctx.putImageData(imageData, 0, 0);
        }
    }

    function recordUndoImage() {
        undoStack.push(ctx.getImageData(0, 0, width, width));
    }

    function recordRedoImage() {
        redoStack.push(ctx.getImageData(0, 0, width, width));
    }

    // 保存
    $('#save')[0].onclick = () => {
        const a = document.createElement('a');
        a.href = canvas.toDataURL("image/png;base64");
        a.download = 'download.png';
        a.click();
    }

});