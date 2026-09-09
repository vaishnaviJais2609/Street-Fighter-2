function updateState(fighter) {
    if (fighter.isAttacking) {
        return; 
    }

    if (window.matchResult) {
        fighter.isAttacking = false;
        if (fighter.velocityY !== 0) {
            fighter.state = fighter.velocityY < 0 ? 'jump' : 'fall';
        } else {
            if (fighter.health <= 0 && fighter.animations['knockdown']) {
                fighter.state = 'knockdown';
            } else {
                fighter.state = 'idle';
            }
        }
        return;
    }

    if (fighter.velocityY < 0) {
        fighter.state = 'jump';
    } else if (fighter.velocityY > 0) {
        fighter.state = 'fall';
    } else if (fighter.velocityX !== 0) {
        if ((fighter.velocityX > 0 && fighter.facing === 1) || (fighter.velocityX < 0 && fighter.facing === -1)) {
            fighter.state = 'walk_forward';
        } else {
            fighter.state = 'walk_backward';
        }
    } else {
        fighter.state = 'idle';
    }
}
