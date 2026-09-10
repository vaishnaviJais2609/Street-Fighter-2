function updateAI(p1, p2) {
    if (p2.aiDecisionTimer > 0) {
        p2.aiDecisionTimer--;
        const floorY = (window.getFloorY && window.canvas) ? window.getFloorY(window.canvas) : 600;
        if (p2.y + p2.height < floorY - 50 && p2.velocityY !== 0) return; 
    }
    if (window.projectiles) {
        for (let i = 0; i < window.projectiles.length; i++) {
            const proj = window.projectiles[i];
            if (proj.state !== 'fireball_impact' && proj.facing !== p2.facing) {
                let distToProj = Math.abs(proj.x - p2.x);
                const floorY = (window.getFloorY && window.canvas) ? window.getFloorY(window.canvas) : 600;
                if (distToProj < 200 && p2.y + p2.height >= floorY - 50) {
                    p2.velocityY = -15;
                    p2.aiDecisionTimer = 40; 
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
        if (p2.aiSpecialCooldown === undefined) p2.aiSpecialCooldown = 0;
        if (p2.aiSpecialCooldown > 0) p2.aiSpecialCooldown--;
        if (absDist <= 95) {
            if (rand < 0.6) {
                p2.attack();
                p2.aiDecisionTimer = 40;
            } else if (rand < 0.8 && absDist < 60) {
                p2.velocityX = p2.facing === 1 ? -p2.speed : p2.speed; 
                p2.aiDecisionTimer = 15;
            } else {
                p2.velocityX = p2.facing === 1 ? -p2.speed : p2.speed; 
                p2.aiDecisionTimer = 20;
            }
        } else if (absDist > 95 && absDist <= 350) {
            if (rand < 0.65) {
                p2.velocityX = p2.facing === 1 ? p2.speed : -p2.speed; 
                p2.aiDecisionTimer = 30;
            } else if (rand < 0.85 && p2.aiSpecialCooldown <= 0) {
                p2.specialMove();
                p2.aiDecisionTimer = 80;
                p2.aiSpecialCooldown = 180;
            } else {
                p2.velocityY = -15;
                p2.velocityX = p2.facing === 1 ? p2.speed : -p2.speed;
                p2.aiDecisionTimer = 50;
            }
        } else {
            if (rand < 0.55 && p2.aiSpecialCooldown <= 0) {
                p2.specialMove();
                p2.aiDecisionTimer = 100;
                p2.aiSpecialCooldown = 180;
            } else {
                p2.velocityX = p2.facing === 1 ? p2.speed : -p2.speed;
                p2.aiDecisionTimer = 40;
            }
        }
    }
}
function checkHits(p1, p2) {
    if (window.matchResult) return;
    if (p1.isAttacking && !p1.hasHit && typeof detectCollision === 'function' && detectCollision(p1, p2)) {
        p1.hasHit = true;
        if (!p2.isCrouching && p2.state !== 'crouch') {
            p2.health -= 10;
            if (p2.health < 0) p2.health = 0;
        }
    }

    if (p2.isAttacking && !p2.hasHit && typeof detectCollision === 'function' && detectCollision(p2, p1)) {
        p2.hasHit = true;
        if (!p1.isCrouching && p1.state !== 'crouch') {
            p1.health -= 10;
            if (p1.health < 0) p1.health = 0;
        }
    }
    if (window.projectiles && typeof detectProjectileCollision === 'function') {
        for (let i = 0; i < window.projectiles.length; i++) {
            const proj = window.projectiles[i];
            if (proj.state !== 'fireball_impact') {
                if (proj.owner !== p2 && detectProjectileCollision(proj, p2)) {
                    proj.state = 'fireball_impact';
                    proj.frameIndex = 0;
                    proj.velocity.x = 0;
                    if (!p2.isCrouching && p2.state !== 'crouch') {
                        p2.health -= 15;
                        if (p2.health < 0) p2.health = 0;
                    }
                }
                else if (proj.owner !== p1 && detectProjectileCollision(proj, p1)) {
                    proj.state = 'fireball_impact';
                    proj.frameIndex = 0;
                    proj.velocity.x = 0;
                    if (!p1.isCrouching && p1.state !== 'crouch') {
                        p1.health -= 15;
                        if (p1.health < 0) p1.health = 0;
                    }
                }
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
        window.timer = timer; // Expose to UI
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
window.resetMatchTimer = function() {
    clearTimeout(timerId);
    timer = 60;
    window.timer = timer;
};