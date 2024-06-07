class CameraManager {
    constructor(initx, inity) {
        this.camera = createVector(initx, inity); // camera position
        this.DRIFT_FACTOR = 15;
        this.true_scroll = createVector(initx, inity);
        this.target = createVector(initx, inity);
    }

    setTarget(entity) {
        this.target = entity;
    }

    setCoordTarget(x, y) {
        this.target = createVector(x, y);
    }

    update() {
        this.true_scroll.x +=
            (this.target.x - this.true_scroll.x) / this.DRIFT_FACTOR;
        this.true_scroll.y +=
            (this.target.y - this.true_scroll.y) / this.DRIFT_FACTOR;
        this.camera.x = this.true_scroll.x;
        this.camera.y = this.true_scroll.y;
        // console.log(this.camera.x, this.camera.y);
    }
}
