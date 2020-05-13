$(function() {
  'use strict';
  const canvas = $('#canvas')[0];
  const canvas2 = $('#canvas2')[0];
  const R = $('#R-range')[0];
  const G = $('#G-range')[0];
  const B = $('#B-range')[0];
  const preview = $('#preview')[0];
  const pencil = $('.fa-pencil-alt')[0];
  const drip = $('.fa-fill-drip')[0];
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const pxSize = 16;
  const dotSize = width / pxSize;
  let isDrip = false;

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

  const chunk = (arr, n) => {
    const len = Math.round(arr.length / n);
    const ret = [];
    for (let i = 0; i < len; i++) {
        ret.push(arr.slice(i * n, i * n + n));
    }
    return ret;
};

  // 色塗り処理
  canvas.addEventListener("click", function(event) {
    var clickX = event.pageX ;
    var clickY = event.pageY ;

    // 要素の位置を取得
    var clientRect = this.getBoundingClientRect() ;
    var positionX = clientRect.left + window.pageXOffset ;
    var positionY = clientRect.top + window.pageYOffset ;

    // 要素内におけるクリック位置を計算
    var x = clickX - positionX ;
    var y = clickY - positionY ;
    if (!isDrip) {
      ctx.fillStyle = preview.style.backgroundColor;
      ctx.fillRect(x - x % dotSize, y - y % dotSize, dotSize, dotSize);
    } else {
      // todo drip
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
  });

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
});