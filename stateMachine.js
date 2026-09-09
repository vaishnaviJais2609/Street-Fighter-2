function updateState(fighter) {
    if (fighter.isAttacking) {
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
