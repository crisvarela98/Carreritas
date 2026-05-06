function applyOffline(){
    let now=Date.now();
    let sec=(now-game.lastTime)/1000;

    if(sec>5){
        let gain=Math.floor(sec*5);
        game.money+=gain;
        notify("Offline +$"+gain);
    }

    game.lastTime=now;
}