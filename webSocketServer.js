import WSServerRoomManager from "./websocket/WSServerPubSub.mjs";

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
    // console.log('Message received:', message);
    wsServer.addChannel(message.session._id, {
        hookSub: () => {
            // if (wsServer.channels.get(message.session._id).clients.size == 2) {
            //     wsServer.pub(message.session._id, { action: 'full' });
            // }
            wsServer.pub(message.session._id, { action: 'playerCount', count: wsServer.channels.get(message.session._id).clients.size+1 });            
            return true;
        },
        // hookPub: (message) => {
        //     if (message.action == 'closeSession') {
        //         wsServer.removeChannel(message.session._id);     
        //         console.log('Channel removed:', message.session._id);           
        //     }            
        // }
       
    });
    console.log('Channel created:', message.session._id);
    // console.log('channels: ', wsServer.channels);
    // console.log(wsServer.hasChannel(message.session._id).clients);
});

wsServer.addRpc('closeChan', (message) => { 
    wsServer.pub(message.session._id, { action: 'closeSession' });
    console.log(wsServer.removeChannel(message.session._id))
     
});

// wsServer.addChannel('api', {
//     usersCanPub: true,
//     usersCanSub: true,
//     hookPub: (message) => {
//         console.log('Message received:', message);
//         wsServer.addChannel(message.session.session_code, {
//             usersCanPub: true,
//             usersCanSub: true,
            // hookPub: (message) => {
            //     console.log('Message received:', message);
            // }
//         })
//     },
    
// });

// wsServer.addChannel('duel_123456', {
//     usersCanPub: true,
//     usersCanSub: true,
// });


wsServer.start();