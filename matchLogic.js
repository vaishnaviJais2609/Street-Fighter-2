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

function determineWinner(p1, p2) {
    if (p1.health === 0 || p2.health === 0) {
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
