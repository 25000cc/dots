$(function() {
  'use strict';
  let canvas = $('#canvas')[0];
  let R = $('#R-range')[0];
  let G = $('#G-range')[0];
  let B = $('#B-range')[0];
  let preview = $('#preview')[0];

  let ctx = canvas.getContext('2d');
  let width = canvas.width;
  let pxSize = 16;
  let dotSize = width / pxSize;

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, width);
  ctx.fillStyle = 'black';

  // グリッド描写
  for (let i = 1; i < pxSize; i++) {
    ctx.beginPath();
    let xy = i * dotSize
    ctx.moveTo(xy, 0);
    ctx.lineTo(xy, width);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, xy);
    ctx.lineTo(width, xy);
    ctx.stroke();
  }

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
    ctx.fillStyle = preview.style.backgroundColor;
    ctx.fillRect(x - x % dotSize, y - y % dotSize, dotSize, dotSize);
  });

  var rangeValue = function (elem, target) {
    return function(evt) {
      target.style.backgroundColor = `rgb(${R.value}, ${G.value}, ${B.value})`;
    }
  }
  R.addEventListener('input', rangeValue(R, preview));
  G.addEventListener('input', rangeValue(G, preview));
  B.addEventListener('input', rangeValue(B, preview));
});