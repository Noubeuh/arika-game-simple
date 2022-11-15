let gridLength = 5;
let actions=['haut','bas','gauche','droite'];

let isWinner=false;
let p = [
    {
        initpos:gridLength*gridLength,
        currpos:gridLength*gridLength,
        lastpos:gridLength*gridLength,
        color:'blue'
    },
    {
        initpos:21,
        currpos:21,
        lastpos:21,
        color:'purple'
    },
    {
        initpos:1,
        currpos:1,
        lastpos:1,
        color:'red'
    },
    {
        initpos:5,
        currpos:5,
        lastpos:5,
        color:'pink'
    }
];
let nbp=p.length;
let nballowedactions=2;
let storedactions=[];
let playerTurn = [];
let counter=0;
let turncounter = 0;
let currplayerindex = 0;
let bg='white';
let toolb;
let promise, limitebas, maxlength, isAnotherPlayer;
let center = Math.round((gridLength*gridLength)/2);

socket.on('update game settings', (gameSettings) => {
    gridLength = parseInt(gameSettings.gridLength);
    center = Math.round((gridLength*gridLength)/2);
    nbp = gameSettings.nbPlayers;
});

socket.on('start game', function() {
    isWinner = false;
    storedactions=[];
    currplayerindex=0;
    playerTurn=[];
    counter=0;
    gameSettings();
});

socket.on('user has quit game', function(){
    $('#grid').empty();
});

function emitAction(action) {
    socket.emit('emit action player', action);
}

socket.on('store action', (action) =>{
    storeAction(action);
});

function gameSettings() {
    $('#grid').empty();
    $('#toolbar').css('display', 'block');
    initgrid();
    createTreasure();
    initPlayers(nbp);
    toolb = document.getElementById('toolbar');
    toolb.style.background=p[turncounter].color;
}

function initgrid() {
    let e=document.getElementById('grid');
    let index=1;
    for(i=0;i<gridLength;i++){
        let tr = document.createElement('tr');
        for(j=0;j<gridLength;j++){
            let td = document.createElement('td');
            td.setAttribute('id', index);
            tr.appendChild(td);
            index++;
        }
        e.appendChild(tr);
    } 
}

function createTreasure(){
    let t=document.getElementById(center);
    t.style.background='yellow';
}

function initPlayers(nbp){
    switch(nbp) {
        case '4':
            p = [
                {
                    initpos:gridLength*gridLength,
                    currpos:gridLength*gridLength,
                    lastpos:gridLength*gridLength,
                    color:'blue'
                },
                {
                    initpos:(gridLength*(gridLength-1))+1,
                    currpos:(gridLength*(gridLength-1))+1,
                    lastpos:(gridLength*(gridLength-1))+1,
                    color:'purple'
                },
                {
                    initpos:1,
                    currpos:1,
                    lastpos:1,
                    color:'red'
                },
                {
                    initpos:gridLength,
                    currpos:gridLength,
                    lastpos:gridLength,
                    color:'pink'
                }
            ];
        break;

        case '2':
            p = [
                {
                    initpos:gridLength*gridLength,
                    currpos:gridLength*gridLength,
                    lastpos:gridLength*gridLength,
                    color:'blue'
                },
                {
                    initpos:1,
                    currpos:1,
                    lastpos:1,
                    color:'red'
                },
            ];
        break;
    }
    for(i=0;i<nbp;i++){
        let pos=document.getElementById(p[i].initpos);
        pos.style.background=p[i].color;
    }
}

function storeAction(a){
    if(storedactions.length<nballowedactions*p.length){
        storedactions.push(a);
        playerTurn.push(turncounter);
        if(storedactions.length==nballowedactions*p.length){
            if(counter<nballowedactions*p.length){
                socket.emit('live action');
                liveAction();
            } else {
                storedactions=[];
                counter=0;
                currplayerindex=0;
                playerTurn=[];
            }
        }
        if (turncounter+1 < p.length) {
            toolb.style.background=p[turncounter+1].color;
            turncounter++;
        } else {
            turncounter = 0;
            toolb.style.background=p[turncounter].color;
        }
        counter++;
    } else {
        if(currplayerindex<(nballowedactions*p.length)){
            liveAction();
        } else {
            storedactions=[];
            currplayerindex=0;
            playerTurn=[];
            counter=0;
            socket.emit('end live action');
        }
    }
}

function liveAction(){
    setTimeout(playAction, 1000, storedactions[currplayerindex], playerTurn[currplayerindex]);
}

function playAction(a, nump){
    if(!isWinner){
        currplayerindex++;
        let currentplayer=p[nump];
        let lastpos=document.getElementById(currentplayer.lastpos);
        maxlength=gridLength-1;
        limitebas=(gridLength*gridLength)-maxlength;
        lastpos.style.background=bg;
        let currentline=currentplayer.currpos/gridLength;
        if(a=="haut"){
            if(currentplayer.lastpos>gridLength){
                currentplayer.currpos= currentplayer.lastpos- gridLength;
                checkIfPlayer(p, currentplayer.currpos, a);
            } else{
                currentplayer.currpos=currentplayer.lastpos + gridLength*maxlength;
                checkIfPlayer(p, currentplayer.currpos, a);
            }
        }
        if(a=="gauche"){
            if(currentplayer.lastpos%gridLength != 1){
                currentplayer.currpos= currentplayer.lastpos-1;
                checkIfPlayer(p, currentplayer.currpos, a);
            } else{
                currentplayer.currpos=currentplayer.lastpos + (gridLength-1);
                checkIfPlayer(p, currentplayer.currpos, a);
            }
        }
        if(a=="droite"){
            if(currentplayer.lastpos%gridLength > 0){
                currentplayer.currpos= currentplayer.lastpos+1;
                checkIfPlayer(p, currentplayer.currpos, a);
            } else{
                currentplayer.currpos=currentplayer.lastpos - (gridLength-1);
                checkIfPlayer(p, currentplayer.currpos, a);
            }
        }
        if(a=="bas"){
            if(currentplayer.lastpos<limitebas){
                currentplayer.currpos= currentplayer.lastpos+gridLength;
                checkIfPlayer(p, currentplayer.currpos, a);
            } else{
                currentplayer.currpos=currentplayer.lastpos -gridLength*maxlength;
                checkIfPlayer(p, currentplayer.currpos, a);
            }
        }
        if(a=="fireleft"){
            if(currentplayer.lastpos%gridLength != 1){
                let firepos = currentplayer.lastpos-1;
                fireAction(firepos, a);
            }
        }
        if(a=="fireright"){
            if(currentplayer.lastpos%gridLength > 0){
                let firepos = currentplayer.lastpos+1;
                fireAction(firepos, a);
            }
        }
        if(a=="firetop"){
            if(currentplayer.lastpos>gridLength){
                let firepos = currentplayer.lastpos - gridLength;
                fireAction(firepos, a);
            }
        }
        if(a=="firebottom"){
            if(currentplayer.lastpos<limitebas){
                let firepos = currentplayer.lastpos+gridLength;
                fireAction(firepos, a);
            }
        }
        currentplayer.lastpos=currentplayer.currpos;
        let newpos=document.getElementById(currentplayer.currpos);
        newpos.style.background=currentplayer.color;
        checkWinner(currentplayer);
        storeAction('');
    }
}

function checkWinner(currplayer){
    if(currplayer.currpos==center && !isWinner){
        isWinner=true;
        let winner=document.createTextNode('Joueur '+currplayer.color+' a gagné');
        let h2=document.getElementById('message');
        h2.appendChild(winner);
    }
}

function checkIfPlayer(ifp, pos, a){
    let bereturned = false ;
    for(i=0;i<ifp.length;i++){
        if(ifp[i].currpos == pos){
            bereturned = true;
            movePlayerPos(i, a);
        }
    }
    return bereturned;
}

function movePlayerPos(i, a){
    if(a=="fireleft" || a =="fireright" || a=="firetop" || a=="firebottom") {
        promise.then(function() {
            if (a=="fireleft"){
                let prout = document.getElementById(p[i].lastpos);
                prout.style.background = bg;

                let nextmove;
                
                // Check grid limitations before moving player
                if(p[i].lastpos%gridLength != 1){
                    nextmove = p[i].lastpos-1;
                } else{
                    nextmove=p[i].lastpos + (gridLength-1);
                }

                if (nextmove == 13) {
                    checkWinner(p[i]);
                }
                
                isAnotherPlayer = [];
                // Check if there is another player in the next location
                isAnotherPlayer = p.map((player, index) => {
                    if (player.currpos == nextmove) {
                        return {check: true, i: index};
                    }
                });

                // Return object where it found another player
                isAnotherPlayer = isAnotherPlayer.find((x) => {
                    if (x != undefined) {
                        return x;
                    }
                });

                if (isAnotherPlayer) {
                    // Move the player which were in the location. Depend of current action.
                    if (isAnotherPlayer.check) {
                        p[isAnotherPlayer.i].currpos=p[isAnotherPlayer.i].lastpos-1;
                    } else {
                        p[isAnotherPlayer.i].currpos=p[isAnotherPlayer.i].lastpos + (gridLength-1);
                    }
                    p[isAnotherPlayer.i].lastpos=p[isAnotherPlayer.i].currpos;
    
                    // Color the player moved
                    let newpos2=document.getElementById(p[isAnotherPlayer.i].currpos);
                    newpos2.style.background=p[isAnotherPlayer.i].color;
                    checkWinner(p[isAnotherPlayer.i]);
                }

                // Setup current player new position
                if(p[i].lastpos%gridLength != 1){
                    p[i].currpos=p[i].lastpos-1;
                } else{
                    p[i].currpos=p[i].lastpos + (gridLength-1);
                }
                p[i].lastpos=p[i].currpos;
        
                // Color the current player with new position
                let newpos=document.getElementById(p[i].currpos);
                newpos.style.background=p[i].color;
            }
            if (a=="fireright"){
                let prout = document.getElementById(p[i].lastpos);
                prout.style.background = bg;

                let nextmove;

                // Check grid limitations before moving player
                if(p[i].lastpos%gridLength > 0){
                    nextmove = p[i].lastpos+1;
                } else{
                    nextmove=p[i].lastpos - (gridLength-1);
                }

                if (nextmove == 13) {
                    checkWinner(p[i]);
                }

                isAnotherPlayer = [];
                // Check if there is another player in the next location
                isAnotherPlayer = p.map((player, index) => {
                    if (player.currpos == nextmove) {
                        return {check: true, i: index};
                    }
                });

                // Return object where it found another player
                isAnotherPlayer = isAnotherPlayer.find((x) => {
                    if (x != undefined) {
                        return x;
                    }
                });

                if (isAnotherPlayer) {
                    // Move the player which were in the location. Depend of current action.
                    if (isAnotherPlayer.check) {
                        p[isAnotherPlayer.i].currpos=p[isAnotherPlayer.i].lastpos+1;
                    } else {
                        p[isAnotherPlayer.i].currpos=p[isAnotherPlayer.i].lastpos - (gridLength-1);
                    }
                    p[isAnotherPlayer.i].lastpos=p[isAnotherPlayer.i].currpos;
    
                    // Color the player moved
                    let newpos2=document.getElementById(p[isAnotherPlayer.i].currpos);
                    newpos2.style.background=p[isAnotherPlayer.i].color;
                    checkWinner(p[isAnotherPlayer.i]);
                }

                if(p[i].lastpos%gridLength > 0){
                    p[i].currpos=p[i].lastpos+1;
                } else{
                    p[i].currpos=p[i].lastpos - (gridLength-1);
                }
                p[i].lastpos=p[i].currpos;
        
                let newpos=document.getElementById(p[i].currpos);
                newpos.style.background=p[i].color;
            }
            if (a=="firetop"){
                let prout = document.getElementById(p[i].lastpos);
                prout.style.background = bg;

                let nextmove;
                
                // Check grid limitations before moving player
                if(p[i].lastpos>gridLength){
                    nextmove = p[i].lastpos-gridLength;
                } else{
                    nextmove=p[i].lastpos + gridLength*maxlength;
                }

                if (nextmove == 13) {
                    checkWinner(p[i]);
                }
                
                isAnotherPlayer = [];
                // Check if there is another player in the next location
                isAnotherPlayer = p.map((player, index) => {
                    if (player.currpos == nextmove) {
                        return {check: true, i: index};
                    }
                });

                // Return object where it found another player
                isAnotherPlayer = isAnotherPlayer.find((x) => {
                    if (x != undefined) {
                        return x;
                    }
                });

                if (isAnotherPlayer) {
                    // Move the player which were in the location. Depend of current action.
                    if (isAnotherPlayer.check) {
                        p[isAnotherPlayer.i].currpos=p[isAnotherPlayer.i].lastpos-gridLength;
                    } else {
                        p[isAnotherPlayer.i].currpos=p[isAnotherPlayer.i].lastpos + gridLength*maxlength;
                    }
                    p[isAnotherPlayer.i].lastpos=p[isAnotherPlayer.i].currpos;
    
                    // Color the player moved
                    let newpos2=document.getElementById(p[isAnotherPlayer.i].currpos);
                    newpos2.style.background=p[isAnotherPlayer.i].color;
                    checkWinner(p[isAnotherPlayer.i]);
                }
                
                if(p[i].lastpos>gridLength){
                    p[i].currpos=p[i].lastpos-gridLength;
                } else {
                    p[i].currpos=p[i].lastpos + gridLength*maxlength;
                }
                p[i].lastpos=p[i].currpos;
        
                let newpos=document.getElementById(p[i].currpos);
                newpos.style.background=p[i].color;
            }
            if (a=="firebottom"){
                let prout = document.getElementById(p[i].lastpos);
                prout.style.background = bg;

                let nextmove;
                
                // Check grid limitations before moving player
                if(p[i].lastpos<limitebas){
                    nextmove = p[i].lastpos+gridLength;
                } else{
                    nextmove=p[i].lastpos -gridLength*maxlength;
                }

                if (nextmove == 13) {
                    checkWinner(p[i]);
                }
                
                isAnotherPlayer = [];
                // Check if there is another player in the next location
                isAnotherPlayer = p.map((player, index) => {
                    if (player.currpos == nextmove) {
                        return {check: true, i: index};
                    } else {
                        return {check: false, i: index};
                    }
                });
                
                // Return object where it found another player
                isAnotherPlayer = isAnotherPlayer.find((x) => {
                    if (x != undefined && x.check == true) {
                        return x;
                    }
                });
                
                if (isAnotherPlayer) {
                    // Move the player which were in the location. Depend of current action.
                    if (isAnotherPlayer.check) {
                        p[isAnotherPlayer.i].currpos=p[isAnotherPlayer.i].lastpos+gridLength;
                    } else {
                        p[isAnotherPlayer.i].currpos=p[isAnotherPlayer.i].lastpos -gridLength*maxlength;
                    }
                    p[isAnotherPlayer.i].lastpos=p[isAnotherPlayer.i].currpos;
                    // Color the player moved
                    let newpos2=document.getElementById(p[isAnotherPlayer.i].currpos);
                    newpos2.style.background=p[isAnotherPlayer.i].color;
                    checkWinner(p[isAnotherPlayer.i]);
                }
                
                if(p[i].lastpos<limitebas){
                    p[i].currpos=p[i].lastpos+gridLength;
                } else {
                    p[i].currpos=p[i].lastpos -gridLength*maxlength;
                }
                p[i].lastpos=p[i].currpos;
        
                let newpos=document.getElementById(p[i].currpos);
                newpos.style.background=p[i].color;
            }
        });
    } else {
        if (a =="bas") {
            if(p[i].lastpos<limitebas){
                p[i].currpos=p[i].lastpos+gridLength;
            } else {
                p[i].currpos=p[i].lastpos -gridLength*maxlength;
            }
            p[i].lastpos=p[i].currpos;
    
            let newpos=document.getElementById(p[i].currpos);
            newpos.style.background=p[i].color;
            checkWinner(p[i]);
        }
        if (a =="haut") {
            if(p[i].lastpos>gridLength){
                p[i].currpos=p[i].lastpos-gridLength;
            } else {
                p[i].currpos=p[i].lastpos + gridLength*maxlength;
            }
            p[i].lastpos=p[i].currpos;
    
            let newpos=document.getElementById(p[i].currpos);
            newpos.style.background=p[i].color;
            checkWinner(p[i]);
        }
        if (a =="droite") {
            if(p[i].lastpos%gridLength > 0){
                p[i].currpos=p[i].lastpos+1;
            } else{
                p[i].currpos=p[i].lastpos - (gridLength-1);
            }
            p[i].lastpos=p[i].currpos;
    
            let newpos=document.getElementById(p[i].currpos);
            newpos.style.background=p[i].color;
            checkWinner(p[i]);
        }
        if (a =="gauche") {
            if(p[i].lastpos%gridLength != 1){
                p[i].currpos=p[i].lastpos-1;
            } else{
                p[i].currpos=p[i].lastpos + (gridLength-1);
            }
            p[i].lastpos=p[i].currpos;
    
            let newpos=document.getElementById(p[i].currpos);
            newpos.style.background=p[i].color;
            checkWinner(p[i]);
        }
    }

}

function fireAction(fpos, a){
    if (a=== 'firetop') {
        while(fpos > gridLength || fpos == 0){
            colorFire(fpos);
            if (checkIfPlayer(p, fpos, a)){
                break;
            }
            if (fpos == 0) {
                break;
            } else {
                fpos = fpos-gridLength;
                colorFire(fpos);
                if (checkIfPlayer(p, fpos, a)){
                    break;
                }
            }
        }
    }
    if (a=== 'firebottom') {
        while(fpos < limitebas || fpos == (gridLength*gridLength)){
            colorFire(fpos);
            if (checkIfPlayer(p, fpos, a)){
                break;
            }
            if (fpos == (gridLength*gridLength)) {
                break;
            } else {
                fpos = fpos+gridLength;
                colorFire(fpos);
                if (checkIfPlayer(p, fpos, a)){
                    break;
                }
            }
        }
    }
    if (a=== 'fireleft') {
        while(fpos%gridLength != 1 || fpos%gridLength == 1){
            colorFire(fpos);
            if (checkIfPlayer(p, fpos, a)){
                break;
            }
            if (fpos%gridLength == 1) {
                break;
            } else {
                fpos = fpos-1;
            }
        }
    }
    if (a=== 'fireright') {
        while(fpos%gridLength > 0 || fpos%gridLength == 0){
            colorFire(fpos);
            if (checkIfPlayer(p, fpos, a)){
                break;
            }
            if (fpos%gridLength == 0) {
                break;
            } else {
                fpos = fpos+1;
            }
        }
    }
}

function colorFire(fpos) {
    let colorfirepos = document.getElementById(fpos);
    colorfirepos.style.background = 'green';
    promise = new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve(clearFire(fpos));
            createTreasure();
        }, 100);
    });
}

function clearFire(fpos) {
    let colorfirepos = document.getElementById(fpos);
    colorfirepos.style.background = bg;
}