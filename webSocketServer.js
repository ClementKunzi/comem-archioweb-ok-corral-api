import WSServerRoomManager from "./websocket/WSServerRoomManager.mjs";

console.log('!!! Websocket server starting...');

const wsServer = new WSServerRoomManager({
    port: 8887,
    origins: '*',
    // authCallback: (token) => {
    //     // TODO check token
    //     console.log('Auth callback:', token);
    //     return true;
    // },
});

wsServer.addRpc('createChan', (message) => {
    console.log('Message received:', message);
    wsServer.addChannel(message.session.session_code);
});

// wsServer.addChannel('api', {
//     usersCanPub: true,
//     usersCanSub: true,
//     hookPub: (message) => {
//         console.log('Message received:', message);
//         wsServer.addChannel(message.session.session_code, {
//             usersCanPub: true,
//             usersCanSub: true,
//             hookPub: (message) => {
//                 console.log('Message received:', message);
//             }
//         })
//     },
    
// });

// wsServer.addChannel('duel_123456', {
//     usersCanPub: true,
//     usersCanSub: true,
// });


wsServer.start();