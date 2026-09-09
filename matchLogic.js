function updateAI(p1, p2) {
    if (p2.aiDecisionTimer > 0) {
        p2.aiDecisionTimer--;
        
        // Let the AI finish its jumping/falling animation
        if (p2.y + p2.height < 600 && p2.velocityY !== 0) return; 
        // Note: 600 is roughly canvas.height - player.height, but Fighter logic handles landing natively
    }

    // Dodge incoming fireballs
    if (window.projectiles) {
        for (let i = 0; i < window.projectiles.length; i++) {
            const proj = window.projectiles[i];
            if (proj.state !== 'fireball_impact' && proj.facing !== p2.facing) {
                let distToProj = Math.abs(proj.x - p2.x);
                if (distToProj < 200 && p2.y + p2.height >= 550) { // If on the ground and fireball is close
                    p2.velocityY = -15; // Jump to dodge!
                    p2.aiDecisionTimer = 40; // Lock decision while jumping
                    return;
                }
            }
        }
    }

    if (p2.aiDecisionTimer <= 0 && !p2.isAttacking) {
        let distance = p1.x - p2.x;
        let absDist = Math.abs(distance);
        let rand = Math.random();

        p2.velocityX = 0;

        if (absDist < 120) {
            // Close range: mostly attack
            if (rand < 0.7) {
                p2.attack();
                p2.aiDecisionTimer = 40;
            } else {
                p2.velocityX = p2.facing === 1 ? -p2.speed : p2.speed; // Walk back
                p2.aiDecisionTimer = 20;
            }
        } else if (absDist >= 120 && absDist <= 350) {
            // Mid range: walk forward, fireball, or jump forward
            if (rand < 0.6) {
                p2.velocityX = p2.facing === 1 ? p2.speed : -p2.speed; // Walk forward
                p2.aiDecisionTimer = 30;
            } else if (rand < 0.9) {
                p2.specialMove();
                p2.aiDecisionTimer = 60;
            } else {
                p2.velocityY = -15;
                p2.velocityX = p2.facing === 1 ? p2.speed : -p2.speed;
                p2.aiDecisionTimer = 50;
            }
        } else {
            // Long range: mostly shoot fireballs or walk forward
            if (rand < 0.7) {
                p2.specialMove();
                p2.aiDecisionTimer = 70;
            } else {
                p2.velocityX = p2.facing === 1 ? p2.speed : -p2.speed;
                p2.aiDecisionTimer = 40;
            }
        }
    }
}

function checkHits(p1, p2) {
    if (p1.isAttacking && typeof detectCollision === 'function' && detectCollision(p1, p2)) {
        p1.isAttacking = false;
        p2.health -= 10;
        if (p2.health < 0) p2.health = 0;
    }

    if (window.projectiles && typeof detectProjectileCollision === 'function') {
        for (let i = 0; i < window.projectiles.length; i++) {
            const proj = window.projectiles[i];
            if (proj.state !== 'fireball_impact' && detectProjectileCollision(proj, p2)) {
                proj.state = 'fireball_impact';
                proj.frameIndex = 0;
                proj.velocity.x = 0;
                p2.health -= 15;
                if (p2.health < 0) p2.health = 0;
            }
        }
    }
}

let timer = 60;
let timerId;
window.matchResult = null;

function decreaseTimer(p1, p2) {
    if (timer > 0) {
        timerId = setTimeout(() => decreaseTimer(p1, p2), 1000);
        timer--;
    }

    if (timer === 0) {
        if (p1.health === p2.health) {
            window.matchResult = 'Tie';
        } else if (p1.health > p2.health) {
            window.matchResult = 'Player 1 Wins';
        } else {
            window.matchResult = 'Player 2 Wins';
        }
    }
}

function determineWinner(p1, p2) {
    if (p1.health === 0 || p2.health === 0) {
        clearTimeout(timerId);
        if (p1.health === 0 && p2.health === 0) {
            window.matchResult = 'Tie';
        } else if (p1.health === 0) {
            window.matchResult = 'Player 2 Wins';
        } else if (p2.health === 0) {
            window.matchResult = 'Player 1 Wins';
        }
    }
}
