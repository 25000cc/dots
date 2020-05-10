$(function() {
  'use strict';
  let canvas = $('#canvas')[0];

  let ctx = canvas.getContext('2d');
  let width = canvas.width;
  let canvasSize = 16;
  let dotSize = width / canvasSize;

  // グリッド描写
  for (let i = 1; i < canvasSize; i++) {
    // ctx.strokeRect(i * dotSize, 0, dotSize, width);
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
    console.log('x: %d', x);
    console.log('y: %d', y);
  });
});