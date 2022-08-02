"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionController = void 0;
const secretary_like_1 = require("secretary-like");
const startable_1 = require("startable");
// import assert = require('assert');
const goal_follower_1 = require("./goal-follower");
// disposable
class PositionController {
    constructor(ctx, throttle) {
        this.ctx = ctx;
        this.throttle = throttle;
        this.$s = (0, startable_1.createStartable)(() => this.rawStart(), () => this.rawStop());
    }
    async rawStart() {
        const positions = await this.throttle.invoke(this.ctx[0][0].getPositions)();
        this.goal = this.latest = positions.position[secretary_like_1.Length.LONG]
            .minus(positions.position[secretary_like_1.Length.SHORT]);
        this.follower = new goal_follower_1.GoalFollower(this.latest, this.ctx, this.throttle);
    }
    async rawStop() { }
    async setGoal(goal) {
        this.goal = this.ctx.DataTypes.hFactory.from(goal);
        await this.follower.$s.starp();
        await this.follower.$s.start([this.goal], err => {
            if (err)
                this.$s.starp(err);
        });
    }
}
exports.PositionController = PositionController;
//# sourceMappingURL=position-controller.js.map