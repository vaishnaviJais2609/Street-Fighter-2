function updateAI(p1, p2) {
    p2.velocityX = 0;
    
    let distance = p1.x - p2.x;
    if (Math.abs(distance) > 50) {
        if (distance > 0) {
            p2.velocityX = p2.speed - 1;
        } else {
            p2.velocityX = -(p2.speed - 1);
        }
    }
}

function checkHits(p1, p2) {
    if (p1.isAttacking && typeof detectCollision === 'function' && detectCollision(p1, p2)) {
        p1.isAttacking = false;
        p2.health -= 10;
        if (p2.health < 0) {
            p2.health = 0;
        }
        document.getElementById('player2-health').style.width = p2.health + '%';
    }
}

let timer = 60;
let timerId;

function decreaseTimer(p1, p2) {
    if (timer > 0) {
        timerId = setTimeout(() => decreaseTimer(p1, p2), 1000);
        timer--;
        document.getElementById('timer').innerText = timer;
    }

    if (timer === 0) {
        let resultDiv = document.getElementById('result-text');
        resultDiv.style.display = 'flex';
        
        if (p1.health === p2.health) {
            resultDiv.innerText = 'Tie';
        } else if (p1.health > p2.health) {
            resultDiv.innerText = 'Player 1 Wins';
        } else {
            resultDiv.innerText = 'Player 2 Wins';
        }
    }
}

function determineWinner(p1, p2) {
    if (p1.health === 0 || p2.health === 0) {
        clearTimeout(timerId);
        let resultDiv = document.getElementById('result-text');
        resultDiv.style.display = 'flex';
        
        if (p1.health === 0 && p2.health === 0) {
            resultDiv.innerText = 'Tie';
        } else if (p1.health === 0) {
            resultDiv.innerText = 'Player 2 Wins';
        } else if (p2.health === 0) {
            resultDiv.innerText = 'Player 1 Wins';
        }
    }
}
