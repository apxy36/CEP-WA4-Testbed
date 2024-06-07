class CameraManager {
    constructor(initx, inity) {
        this.camera = createVector(initx, inity); // camera position
        this.DRIFT_FACTOR = 15;
        this.true_scroll = createVector(initx, inity);
        this.target = createVector(initx, inity);

        this.true_scale = 1;
        this.targetscaling = 1;
    }

    setTarget(entity) {
        this.target = entity;
    }

    setCoordTarget(x, y) {
        this.target = createVector(x, y);
    }

    setScaling(scaling) {
        this.targetscaling = scaling;
    }

    update() {
        this.true_scroll.x +=
            (this.target.x - this.true_scroll.x) / this.DRIFT_FACTOR;
        this.true_scroll.y +=
            (this.target.y - this.true_scroll.y) / this.DRIFT_FACTOR;
        this.camera.x = this.true_scroll.x;
        this.camera.y = this.true_scroll.y;
        // console.log(p5.Vector.sub(this.target, this.camera).mag());
        let dist = p5.Vector.sub(this.target, this.camera).mag();
        if (dist< 1) {    
            this.camera = this.target.copy();
            this.true_scale += (this.targetscaling - this.true_scale) / (this.DRIFT_FACTOR / 2)
            // console.log("reached target");
        } else if (dist < 100) {
            // console.log(this.targetscaling, this.true_scale, this.targetscaling - this.true_scale)
            this.true_scale += (this.targetscaling - this.true_scale) / (this.DRIFT_FACTOR / 2) * (dist / 100);
            // this.camera = p5.Vector.add(this.camera, p5.Vector.sub(this.target, this.camera).normalize().mult(10));
        }
        // console.log(this.targetscaling, this.true_scale, this.targetscaling - this.true_scale)
        
        // console.log(this.camera.x, this.camera.y);
    }
}
