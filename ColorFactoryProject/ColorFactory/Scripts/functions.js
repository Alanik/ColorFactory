function DrawPattern() {
    var can = document.getElementById('mapCanvas');
    var ctx = can.getContext('2d');
    
    ctx.fillStyle = "rgb(188, 222, 178)";
    ctx.fillRect(0, 0, 400, 400);
}