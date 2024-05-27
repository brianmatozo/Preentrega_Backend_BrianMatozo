document.addEventListener('DOMContentLoaded', (event) => {
    var socket = io();

    socket.on('connect', function() {
        console.log('conectado al server 8080');
    });

    socket.on('disconnect', function() {
        console.log('conectado al server 8080');
    });

    socket.on('message', function(msg) {
        console.log('mensaje: ', msg);
    });
});
