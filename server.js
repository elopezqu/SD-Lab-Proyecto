const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let currentEditorContent = ''; 
app.use(express.static(__dirname + '/public'));

app.get('/editor', (req, res) => {
    res.sendFile(__dirname + '/editor.html');
});

io.on('connection', (socket) => {
    console.log('New user connected');

    const serverIp = getServerIp();
    console.log(`Ip de la sala: ${serverIp}`);

    socket.emit('initialContent', currentEditorContent);

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('codeChange', (data) => {
        currentEditorContent = data;
        socket.broadcast.emit('codeChange', data);     
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`http://localhost:${port}`);
});

function getServerIp() {
    const interfaces = os.networkInterfaces();
    for (let iface in interfaces) {
        for (let alias of interfaces[iface]) {
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '127.0.0.1'; 
}
