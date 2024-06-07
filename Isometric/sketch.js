const GRID_SIZE = 10;

let tile_images = [];
const TILE_WIDTH = 32;
const TILE_HEIGHT = 16;
let GRID_SCALE = 1.0;


//next, to change the "x" into numbers, and then to change the numbers into images
//then to change the images into the isometric view
// then to revamp map generation





let grid = [
  [14, 23, 23, 23, 23, 23, 23, 23, 23, 13],
  [21, 32, 33, 33, 28, 33, 28, 33, 31, 20],
  [21, 34,  0,  0, 25, 33, 30,  1, 34, 20],
  [21, 34,  0,  0, 34,  1,  1, 10, 34, 20],
  [21, 25, 33, 33, 24, 33, 33, 33, 27, 20],
  [21, 34,  4,  7, 34, 18, 17, 10, 34, 20],
  [21, 34,  4,  7, 34, 16, 19, 10, 34, 20],
  [21, 34,  6,  8, 34, 10, 10, 10, 34, 20],
  [21, 29, 33, 33, 26, 33, 33, 33, 30, 20],
  [11, 22, 22, 22, 5, 22, 22, 22, 22, 12]
];


let graphics
let cam
function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i <= 114; i++) {
    tile_images.push(loadImage("./new_tileset/tile_" + i.toString().padStart(3, '0') + ".png"));
  }

  map = new Grid(80, 80, 32, tile_images)
  cam = new CameraManager(windowWidth / 2, windowHeight / 2);
  graphics = createGraphics(windowWidth, windowHeight);
  map.buildMap(map);
}

function draw_tile(img, x, y, graphics) {
  let x_screen = x_start + (x - y) * TILE_WIDTH/2;
  let y_screen = y_start + (x + y) * TILE_HEIGHT/2;
  graphics.image(img, x_screen, y_screen);
}
//z axis simulated by toggling collider types?
function draw_grid(graphic) {
  x_start = width/2 - TILE_WIDTH/2;
  y_start = height/2 - GRID_SIZE * TILE_HEIGHT/2;
  //i is x
  for (let i = 0; i < GRID_SIZE; i++) {
    let y = 0;
    let x = 0;
    //we assume square grid
    // when i = 0, y can only be 0
    // when i = 1, y can be 0 or 1
    // when i = 2, y can be 0, 1, or 2
    while (i >= y) {
      draw_tile(tile_images[grid[y][i]], i, y, graphic);
      y++;
    }
    while (i >= x) {
      draw_tile(tile_images[grid[i][x]], x, i, graphic);
      x++;
    }
    // for (let j = 0; j < GRID_SIZE; j++) {
    //   draw_tile(tile_images[grid[j][i]], i, j); //sequential, use while loop now (while x > y, draw_tile, y++ )
    // }
  }
}

function draw() {
  background("black");
  // draw_grid(graphics);
  // let newGraphics = createGraphics(windowWidth * GRID_SCALE, windowHeight * GRID_SCALE);
  // newGraphics.image(graphics,  -windowWidth / 2* (GRID_SCALE - 1), -windowHeight / 2 * (GRID_SCALE - 1), windowWidth * GRID_SCALE, windowHeight * GRID_SCALE);
  // image(graphics,  -windowWidth / 2* (GRID_SCALE - 1),  - windowHeight / 2 * (GRID_SCALE - 1), windowWidth * GRID_SCALE, windowHeight * GRID_SCALE);
  // image(graphics, 0,0)
  // graphics = newGraphics;
  cam.update()
  map.displayIso(cam.camera.x, cam.camera.y);
  reSize();
  moveCamera();
}

function reSize(){
  if (kb.pressing("ArrowUp")){
    GRID_SCALE += 0.01;
  } else if (kb.pressing("ArrowDown")){
    GRID_SCALE -= 0.01;
  }
}

function moveCamera(){
  if (kb.pressing("w")){
    console.log("w")
    cam.setCoordTarget(cam.target.x, cam.target.y - 1 * map.gridscale);
  } else if (kb.pressing("s")){
    cam.setCoordTarget(cam.target.x, cam.target.y + 1* map.gridscale);
  } else if (kb.pressing("a")){
    cam.setCoordTarget(cam.target.x - 1* map.gridscale, cam.target.y);
  } else if (kb.pressing("d")){
    cam.setCoordTarget(cam.target.x + 1* map.gridscale, cam.target.y);
  }
}