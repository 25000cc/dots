$(function() {
  'use strict';
  const canvas = $('#canvas')[0];
  const canvas2 = $('#canvas2')[0];
  const R = $('#R-range')[0];
  const G = $('#G-range')[0];
  const B = $('#B-range')[0];
  const preview = $('#preview')[0];
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const pxSize = 16;
  const dotSize = width / pxSize;
  let undoStack = [];
  let redoStack = [];

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, width);
  ctx.fillStyle = 'black';

  // グリッド描写
  let ctx2 = canvas2.getContext('2d');
  for (let i = 1; i < pxSize; i++) {
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

  const pencil = $('.fa-pencil-alt')[0];
  const drip = $('.fa-fill-drip')[0];
  const dropper = $('.fa-eye-dropper')[0];
  let isDrip = false;
  let isDropper = false;

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
  dropper.onclick = () => {
    if (!isDropper) {
      dropper.style.marginTop = '5px';
      dropper.style.color = 'gray';
      isDropper = true;
    } else {
      cancelDropper()
    }
  }
  function cancelDropper() {
    dropper.style.marginTop = '0px';
    dropper.style.color = 'black';
    isDropper = false;
  }

  canvas.addEventListener("click", function(event) {
    const rect = event.target.getBoundingClientRect()
    let x = Math.round(event.clientX - rect.left);
    let y = Math.round(event.clientY - rect.top);
    if (isDropper) { // 塗りつぶし（バケツ）
      dropper_(x, y);
    } else if (isDrip) { // スポイト
      recordUndoImage();
      drip_(x, y);
    } else { // 1マス塗り
      recordUndoImage();
      singlePaint(x, y);
    }
  });

  function drip_(x, y) {
    let matrix = [];
    const data = ctx.getImageData(0, 0, width, width).data;
    for(let i = 0; i < Math.ceil(data.length / 4); i++) {
      const start = i * 4;
      const point = data.slice(start, start + 4);
      matrix.push(`${point[0]},${point[1]},${point[2]},${point[3]}`);
    }
    matrix = chunk(matrix, width);
    const floodFillCanvas = new FloodFillCanvas(matrix);
    floodFillCanvas.replaceColor = `${R.value},${G.value},${B.value},255`;
    const table = floodFillCanvas.fill(x, y);
    const imageData = ctx.getImageData(0, 0, width, width);
    table.forEach((row, y) => {
      row.forEach((col, x) => {
        const pos = floodFillCanvas.startPosition(x, y);
        if (table[y][x] === `${R.value},${G.value},${B.value},255`) {
          imageData.data[pos] = R.value;
          imageData.data[pos + 1] = G.value;
          imageData.data[pos + 2] = B.value;
          imageData.data[pos + 3] = 255;
        }
      })
    })
    ctx.putImageData(imageData, 0, 0)
  }

  function dropper_(x, y) {
    const imageData = ctx.getImageData(x, y, 1, 1);
    const r = imageData.data[0];
    const g = imageData.data[1];
    const b = imageData.data[2];
    setColor(r, g, b)
    cancelDropper();
  }
  
  function singlePaint(x, y) {
    ctx.fillStyle = preview.style.backgroundColor;
    ctx.fillRect(x - x % dotSize, y - y % dotSize, dotSize, dotSize);
  }

  function setColor(r, g, b) {
    preview.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    R.value = r;
    G.value = g;
    B.value = b;
  }

  // RGB
  function RGBrange(elem, target) {
    return function(evt) {
      target.style.backgroundColor = `rgb(${R.value}, ${G.value}, ${B.value})`;
    }
  }
  const RGB = [R, G, B];
  for (let rgb of RGB) {
    rgb.addEventListener('input', RGBrange(rgb, preview));
  }

  // キャンバスをクリア
  $('#clear')[0].onclick = () => {
    let result = window.confirm("キャンバスをまっ白にしますか？");
    if (result) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, width)
    }
  }

  // カラーパレット
  for (let i = 1; i < 9; i++) {
    const block = $(`#block${i}`)[0];
    block.onclick = () => {
      const backgroundColor = window.getComputedStyle(block).backgroundColor;
      const arr = backgroundColor.match(/[0-9]+\.?[0-9]*/g);
      setColor(arr[0], arr[1], arr[2])
    }
  }

  // undo redo
  $('.fa-reply')[0].onclick = () => {
    if (undoStack.length!=0) {
      const imageData = undoStack.pop();
      recordRedoImage();
      ctx.putImageData(imageData, 0, 0);
    }
  }
  $('.fa-share')[0].onclick = () => {
    if (redoStack.length!=0) {
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
});