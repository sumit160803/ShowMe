const APP_ID = '585d0e7d00b74fcdb50315f9b7021a99';
const CHANNEL = sessionStorage.getItem('room')
const TOKEN = sessionStorage.getItem('token')

let UID = Number(sessionStorage.getItem('UID'))

let NAME = sessionStorage.getItem('name')
// alert("WOOHOOOO CONNECTED JS TO HTML USING DJANGO")
const client = AgoraRTC.createClient({mode:'rtc',codec:'vp8'})

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async() =>{

    document.getElementById('room-name').innerText = CHANNEL
    client.on('user-published',handleUserJoined)
    client.on('user-left',handleUserLeft)

    try{
        await client.join(APP_ID,CHANNEL,TOKEN,UID)
    }
    catch(error){
        console.error(error)
        window.open('/','_self')
    }

    
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    let member = await createUser()

    let player = `<div class="video-container" id="user-container-${UID}">
                <div class="username-wrapper"> <span class="user-name">${member.name}</span> </div>
                <div class="video-player" id="user-${UID}"></div>
                </div>`

    document.getElementById('video-streams').insertAdjacentHTML('beforeend',player)

    localTracks[1].play(`user-${UID}`)

    await client.publish([localTracks[0],localTracks[1]])

}

let handleUserJoined = async(user,mediaType) =>{
    remoteUsers[user.uid] = user
    await client.subscribe(user,mediaType)

    if(mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)

        if(player != null){
            player.remove()       //remove already existing user
        }

        let member = await getUser(user)
        player = `<div class="video-container" id="user-container-${user.uid}">
                <div class="username-wrapper"> <span class="user-name">${member.name}</span> </div>
                <div class="video-player" id="user-${user.uid}"></div>
                </div>`

        document.getElementById('video-streams').insertAdjacentHTML('beforeend',player)

        user.videoTrack.play(`user-${user.uid}`)
    }

    if(mediaType === 'audio'){
        user.audioTrack.play()
    }
}

let handleUserLeft = async(user)=>{
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()

}

let leaveAndRemoveLocalStream = async() =>{
    for(let i=0;i<localTracks.length;i++){
        localTracks[i].stop()  //iske baad open kr skte bc
        localTracks[i].close() //iske baad open nhi ho skta
    }

    await client.leave()

    deleteUser() 
    window.open('/','_self')
}

let toggleCamera = async(e)=>{
    if(localTracks[1].muted){
        //if muted
        await localTracks[1].setMuted(false) //unmute it
        e.target.style.backgroundColor = '#ffffff'
    }
    else{
        await localTracks[1].setMuted(true) //mute it
        e.target.style.backgroundColor = 'rgb(255,80,80)'
    }   
}

let toggleMute = async(e)=>{
    if(localTracks[0].muted){
        //if muted
        await localTracks[0].setMuted(false) //unmute it
        e.target.style.backgroundColor = '#ffffff'
    }
    else{
        await localTracks[0].setMuted(true) //mute it
        e.target.style.backgroundColor = 'rgb(255,80,80)'
    }   
}

let createUser = async()=>{
     let response = await fetch('/create_user/',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({'name':NAME,'room_name':CHANNEL,'UID':UID})
     })

     let member = await response.json()

     return member
}

let getUser = async (user) => {
    let response = await fetch(`/get_user/?UID=${user.uid}&room_name=${CHANNEL}`)
    let member = await response.json()
    return member
}

let deleteUser = async () => {
    let response = await fetch('/delete_user/', {
        method:'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body:JSON.stringify({'name':NAME, 'room_name':CHANNEL, 'UID':UID})
    })
    let member = await response.json()
}

joinAndDisplayLocalStream()

window.addEventListener('beforeunload',deleteUser)

document.getElementById('leave-btn').addEventListener('click',leaveAndRemoveLocalStream)

document.getElementById('camera-btn').addEventListener('click',toggleCamera)

document.getElementById('mic-btn').addEventListener('click',toggleMute)

