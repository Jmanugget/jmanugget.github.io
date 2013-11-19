define(['app/eventmanager', 'app/entity/worldentity', 'app/world', 'app/graphics/graphics', 
        'app/gamestate', 'app/action/actionfactory', 'app/gamecontent'], 
		function(EventManager, WorldEntity, World, Graphics, State, ActionFactory, Content) {
	var dude = function() {
		this._el = null;
		this.carrying = null;
		this.action = null;
		State.health = State.maxHealth();
		Graphics.updateHealth(State.health, State.maxHealth());
		Graphics.updateExperience(State.xp, this.toLevel());
		this.shield = 0;
		this.sword = 0;
	};
	dude.prototype = new WorldEntity({
		className: 'dude'
	});
	dude.constructor = dude;
	
	dude.prototype.el = function() {
		if(this._el == null) {
			this._el = WorldEntity.prototype.el.call(this)
				.append(Graphics.make("animationLayer nightSprite"))
				.append(Graphics.make("heldBlock"));
		}
		return this._el;
	};
	
	dude.prototype.getAnimation = function(label) {
		if(label == "right" && this.carrying != null) {
			return 9;
		}
		return WorldEntity.prototype.getAnimation.call(this, label);
	};
	
	dude.prototype.think = function() {
		if(this.isIdle() && this.action == null) {
			var activity = World.getActivity();
			if(activity != null) {
				this.action = activity;
				this.action.doAction(this);
			}
		}
	};
	
	dude.prototype.gainXp = function(xp) {
		xp = xp || 0;
		State.xp += xp;
		if(isNaN(State.xp)){
			State.xp = 0;
		}
		if(State.xp >= this.toLevel()) {
			State.xp -= this.toLevel();
			State.level++;
			Graphics.levelUp(this);
			State.health = State.maxHealth();
			Graphics.updateHealth(State.health, State.maxHealth());
			EventManager.trigger('levelUp');
			if(this.action != null) {
				this.action.terminateAction(this);
			}
		}
		Graphics.updateExperience(State.xp, this.toLevel());
	};
	
	dude.prototype.toLevel = function() {
		return 40 * State.level;
	};
	
	dude.prototype.heal = function(amount) {
		State.health += amount;
		State.health = State.health > State.maxHealth() ? State.maxHealth() : State.health;
		Graphics.updateHealth(State.health, State.maxHealth());
	};
	
	dude.prototype.getDamage = function(damageToKill) {
		var damage = 1;
		damageToKill -= damage;
		if(this.sword > 0) {
			var add = this.sword > damageToKill ? damageToKill : this.sword;
			damage += add;
			this.sword -=  add;
			Graphics.updateSword(this.sword, State.maxSword());
		}
		return damage;
	};
	
	dude.prototype.takeDamage = function(damage) {
		if(State.health > 0) {
			if(this.shield > 0) {
				var blocked = damage > this.shield ? this.shield : damage;
				this.shield -= blocked;
				damage -= blocked;
				Graphics.updateShield(this.shield, State.maxShield());
			}
			State.health -= damage;
			State.health = State.health < 0 ? 0 : State.health;
			Graphics.updateHealth(State.health, State.maxHealth());
		}
	};
	
	dude.prototype.animate = function() {
		WorldEntity.prototype.animate.call(this);
		if(this.carrying != null) {
			if(this.frame == 1) {
				this.carrying.el().css('top', '1px');
			} else if(this.frame == 3) {
				this.carrying.el().css('top', '-1px');
			} else {
				this.carrying.el().css('top', '0px');
			}
		}
	};
	
	return dude;
});