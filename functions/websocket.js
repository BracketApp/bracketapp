const WebSocket = require('ws');

const createWebSocket = () => {

    // Create a WebSocket server on port 8080
    const wss = new WebSocket.Server({ port: 8080 });

    wss.on('connection', (ws) => {
        // console.log('New client connected');

        // Handle incoming messages from a client
        ws.on('message', (message) => {
            console.log('Received:', message.toString());

            // Broadcast the message to all connected clients
            /*wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(`Broadcast: ${message.toString()}`);
                }
            });*/
        });

        // Handle connection close
        ws.on('close', () => {
            console.log('Client disconnected');
        });

        // Send a welcome message to the new client
        // ws.send(`Welcome to the WebSocket server!`);
    })

    console.log('WebSocket server is running on ws://localhost:8080');

    global.wss = wss
}

const connectToWebSocket = ({ serverID, port }) => {

    const ws = new WebSocket('ws://localhost:8080');

    ws.on('open', () => {
        //console.log('Connected to the WebSocket server');

        // Send a message to the WebSocket server
        ws.send(`Hello from ${serverID} client port ${port}!`);

        // Listen for broadcast messages from the WebSocket server
        ws.on('message', (message) => {
            console.log(`Port ${port} received:`, message.toString());
        });
        
        // Handle connection close
        ws.on('close', () => {
            setTimeout(() => global.ws = connectToWebSocket(), 2000)
            console.log('Connection closed');
        });
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    return ws
}

module.exports = { createWebSocket, connectToWebSocket }