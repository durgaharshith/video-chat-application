const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

var peer=new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3000'
})
let myVideoStream;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    console.log('Successfully got media stream');
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        console.log('Receiving a call...');
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            console.log('Receiving stream from another user');
            addVideoStream(video, userVideoStream);
        });
        call.on('close', () => {
            console.log('Call closed');
            video.remove();
        });
    });

    socket.on('user-connected', userId => {
        console.log(`New user connected: ${userId}`);
        setTimeout(() => {
            // Delaying the connection to ensure the other user is ready
            connectToNewUser(userId, stream);
        }, 1000);
    });
    let text = $('input')

    $('html').keydown((e)=> {
        if(e.which ==13 && text.val().length !== 0){
            socket.emit('message', text.val());
            text.val('')
    
        }
    })
    
    socket.on('createMessage',message =>{
        $('ul').append(`<li class="message"><b>user</b><br/>${message}</li>`)
        scrollToBottom();
    })

}).catch(error => {
    console.error('Error accessing media devices.', error);
});

peer.on('open', id => {
    console.log(`Peer connected with ID: ${id}`);
    socket.emit('join-room', ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
    console.log(`Calling new user: ${userId}`);
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        console.log('Stream received from the new user');
        addVideoStream(video, userVideoStream);
    });
    call.on('close', () => {
        console.log('Call closed');
        video.remove();
    });
};

const addVideoStream = (video, stream) => {
    console.log('Adding video stream to DOM');
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
};

const scrollToBottom =() =>{
    let d = $('.main_chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () =>{
    const enabled=myVideoStream.getAudioTracks()[0].enabled;
    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled=false;
        setUnmuteButton();
    }
    else{
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled=true;
    }
}

const setMuteButton=()=>{
    const html = `
        <i class="fas fa-microphone"></i>
        <span>Mute</span>
    `
    document.querySelector('.main_mute_button').innerHTML=html;
}

const setUnmuteButton = () => {
    const html =`
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
    `
    document.querySelector('.main_mute_button').innerHTML=html;
}

const stopStartVideo =() =>{
    
    if(myVideoStream.getVideoTracks()[0].enabled){
        myVideoStream.getVideoTracks()[0].enabled=false;
        setStopVideo();
    }else{
        setStartVideo();
        myVideoStream.getVideoTracks()[0].enabled=true;
    }
}

const setStartVideo=()=>{
    const html = `
        <i class="fas fa-video"></i>
        <span>Stop Video</span>
    `
    document.querySelector('.main_stopVideo_button').innerHTML=html;
}

const setStopVideo = () => {
    const html =`
        <i class="video fas fa-video-slash"></i>
        <span>Video</span>
    `
    document.querySelector('.main_stopVideo_button').innerHTML=html;
}