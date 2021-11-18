import io from 'socket.io-client';

// const socket = io('/dcenter');




export default function() {
    let client = null;

    // if(client !== null){
    //     return client;
    // }
    return client = io('/dcenter');
}

// export default socket;