define(['app/entity/worldentity', 'app/gamecontent'], function(WorldEntity, Content) {
	
	var building = function(options) {
		this.options = $.extend({}, this.options, {
			type: Content.BuildingType.Shack
		}, options);
		
		this.requiredResources = {};
		for(var i in this.options.type.cost) {
			requiredResources[i] = this.options.type.cost[i];
		}
		
		this.built = false;
		
		this.p(this.options.type.position);
	};
	building.prototype = new WorldEntity({
		className: 'building'
	});
	building.constructor = building;
	
	building.prototype.el = function() {
		if(this._el == null) {
			this._el = WorldEntity.prototype.el.call(this).addClass(this.options.type.className);
		}
		return this._el;
	};
	
	building.prototype.readyToBuild = function() {
		if(this.built) {
			return false;
		}
		for(var r in this.requiredResources) {
			if(this.requiredResources[r] > 0) {
				return false;
			}
		}
		return true;
	};
	
	building.prototype.dudeSpot = function() {
		return this.p() + this.el().width() / 2;
	};
	
	return building;
});