class Tile{
  constructor(x, y, z, type){
    this.x = x;
    this.y = y;
    this.z = z;
    this.type = type;
  }

}


class Grid{
  constructor(width, height, cellSize, tile_images){ // width and height in tiles, width is to the right, height is to left cuz isometric
    this.grid = new Map();
    this.width = width;
    this.GRID_SIZE = width;
    this.height = height;
    this.tile_images = tile_images;
    this.gridarray = this.generateMapWithCenterRoom(this.width,this.height,8,10)
    console.log(this.gridarray)
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        this.grid.set(i + "_" + j, new Tile(i, j, round(random(0,2)), 0));
      }
    }
    this.generateMap();
    // console.log(this.grid, this.width, this.height, this.gridarray)

    this.cellSize = cellSize;
    this.numCols = width;
    this.numRows = height;
    this.mapTiles = null;
    this.mapDiagram = null;
    this.mapBuilt = false;
    this.mapX = 0;
    this.mapY = 0;

    this.w  = 2;
    this.h = 2;


    // Store the location of the real treasure room
    this.realTreasureRoomLocation = [];

    // Stores location of map overlay areas
    this.mapOverlayAreas;

    // Create sprite groups based on the different tiles available in the map
    this.floorBricks = new Group();
    this.wallBricks1 = new Group();
    this.boundaryBricks = new Group();
    this.emptyBricks = new Group();
    this.goldBricks = new Group();
    this.coingroup = new Group();
    this.mapOverlayAreaSprite = new Group();
  
    this.graphics = createGraphics(windowWidth, windowHeight);
    this.gridscale = 1.0;
    this.TILE_WIDTH = cellSize;
    this.TILE_HEIGHT = 16;
    this.graphics = this.draw_grid(windowWidth/2, windowHeight/2, this.graphics);
  }

  get_tile(x, y){
    return this.grid.get(x + "_" + y);
  }
  generateMap(){
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        this.grid.set(i + "_" + j, new Tile(i, j, round(random(0,2)), this.gridarray[j][i]));
      }
    }
  }
  // temporary generation function for testing
  generateMapWithCenterRoom(mapWidth, mapHeight, treasureRoomWidth, treasureRoomHeight) {
      // Initialize the map with "*" for the outside area.
      let map = Array.from({ length: mapHeight }, () => Array(mapWidth).fill('_'));

      // Set the outer boundary of the map as "x".
      for (let y = 0; y < mapHeight; y++) {
          for (let x = 0; x < mapWidth; x++) {
              if (x === 0 || y === 0 || x === mapWidth - 1 || y === mapHeight - 1) {
                  map[y][x] = 'x';
              }
          }
      }

      let rooms = []; // To keep track of the rooms' coordinates and sizes.

      // Helper function to check if a room can be placed.
      function canPlaceRoom(topLeftX, topLeftY, roomWidth, roomHeight) {
          if (topLeftX + roomWidth + 1 >= mapWidth || topLeftY + roomHeight + 1 >= mapHeight || topLeftX < 1 || topLeftY < 1) {
              return false; // Room goes out of the boundary or touches the boundary edge.
          }

          return rooms.every(room => {
              return topLeftX + roomWidth < room.x || topLeftX > room.x + room.width ||
                  topLeftY + roomHeight < room.y || topLeftY > room.y + room.height;
          });
      }

      // Helper function to place a room on the map.
      function placeRoom(topLeftX, topLeftY, roomWidth, roomHeight, isTreasureRoom) {
          for (let y = topLeftY; y < topLeftY + roomHeight; y++) {
              for (let x = topLeftX; x < topLeftX + roomWidth; x++) {
                  if (y === topLeftY || y === topLeftY + roomHeight - 1 || x === topLeftX || x === topLeftX + roomWidth - 1) {
                      map[y][x] = '1'; // Place wall
                  } else {
                      if (isTreasureRoom) {
                          map[y][x] = 'G';
                      }
                      else {
                          map[y][x] = '-'; // Place path inside the room
                      }
                  }
              }
          }
          rooms.push({ x: topLeftX, y: topLeftY, width: roomWidth, height: roomHeight });
      }

      // Ensure a central room is always placed first. Its location is fixed
      const [centralRoomWidth, centralRoomHeight] = [40, 12]

      // Minus 2 to avoid touching boundary walls
      // Minus additional 4 from mapHeight to ensure the  center room is slightly above the boundary edge
      const centralRoomLocation = {
          x: Math.floor((mapWidth - centralRoomWidth - 2) / 2),
          y: Math.floor((mapHeight - centralRoomHeight - 2 - 4) / 2)
      };

      placeRoom(centralRoomLocation.x, centralRoomLocation.y + (mapHeight - 12) / 2, centralRoomWidth, centralRoomHeight, false);

      this.centralRoomLocation = {
          x: centralRoomLocation.x,
          y: centralRoomLocation.y + (mapHeight - 12) / 2
      };

      this.centralRoomHeight = centralRoomHeight;
      this.centralRoomWidth = centralRoomWidth;

      // Attempt to place 3 other treasure rooms on the map.
      let numTreasureRooms = 0;
      // Randomly generate which treasure room contains the real gold
      let realTreasureRoomIndex = Math.floor(this.random(0, 2));
      this.realTreasureRoomIndex = realTreasureRoomIndex;

      while (numTreasureRooms < 3) {
          const topLeftX = Math.floor(Math.random() * (mapWidth - treasureRoomWidth - 1)) + 1;
          // Rooms must spawn above the central room
          const topLeftY = Math.floor(Math.random() * (this.centralRoomLocation.y - treasureRoomHeight - 1)) + 1;

          let vertDistBetwTreasureMainRm = Math.abs((topLeftY + treasureRoomHeight) - (this.centralRoomLocation.y));

          if (canPlaceRoom(topLeftX, topLeftY, treasureRoomWidth, treasureRoomHeight) && vertDistBetwTreasureMainRm > 15) {
              placeRoom(topLeftX, topLeftY, treasureRoomWidth, treasureRoomHeight, true);

              if (numTreasureRooms == realTreasureRoomIndex) {
                  // Push the real treasure room to the global variable
                  this.realTreasureRoomLocation = { x: topLeftX, y: topLeftY, width: treasureRoomWidth, height: treasureRoomHeight };
                  // this.realTreasureRoomLocationCoords = {x : topLeftX * 32 }
              }

              numTreasureRooms += 1;
          }
      }

      return map.map(row => row.join(''));
  }

  buildMap() {
    // Leveraging p5play mechanics to manage player movement

      // Clear existing map before building
      if (this.mapTiles != null) {
          this.mapTiles.removeAll();
      }

      this.numCols = this.numCols;
      this.numRows = this.numRows;
      this.mapDiagram = createGraphics(this.numCols * this.w, this.numRows * this.h);

      // Construct map based on this from server side


      this.floorBricks.w = this.cellSize; // Width of each brick
      this.floorBricks.h = this.cellSize; // Height of each brick
      this.floorBricks.tile = "_";
      this.floorBricks.color = this.wallColor;
      this.floorBricks.collider = 'static';
      this.floorBricks.stroke = this.wallColor;
      this.floorBricks.layer = 990;
    //   this.floorBricks.img = "./textures/wall.png";

      this.wallBricks1.w = this.cellSize;
      this.wallBricks1.h = this.cellSize;
      this.wallBricks1.tile = "1";
      this.wallBricks1.color = this.pathColor;
      this.wallBricks1.collider = 'static';
      this.wallBricks1.stroke = this.pathColor;
      this.wallBricks1.layer = 990;
    //   this.wallBricks1.img = "./textures/path.png";

      this.boundaryBricks.w = this.cellSize;
      this.boundaryBricks.h = this.cellSize;
      this.boundaryBricks.tile = "x";
      this.boundaryBricks.color = this.boundaryColor;
      this.boundaryBricks.collider = 'static';
      this.boundaryBricks.stroke = this.boundaryColor;
      this.boundaryBricks.layer = 990;
    //   this.boundaryBricks.img = "./textures/boundary.png";

      this.goldBricks.w = this.cellSize;
      this.goldBricks.h = this.cellSize;
      this.goldBricks.tile = "G";
      this.goldBricks.color = this.goldColor;
      this.goldBricks.collider = 'static';
      this.goldBricks.stroke = this.goldColor;
      this.goldBricks.overlaps(allSprites);
      this.goldBricks.layer = -999;
    //   this.goldBricks.img = "./textures/gold.png";

      this.emptyBricks.w = this.cellSize;
      this.emptyBricks.h = this.cellSize;
      this.emptyBricks.tile = "-";
      this.emptyBricks.color = "#484848";
      this.emptyBricks.collider = 'static';
      this.emptyBricks.stroke = "#484848";
      this.emptyBricks.overlaps(allSprites);
      this.emptyBricks.layer = -999;
    //   this.emptyBricks.img = "./textures/empty.png";

      // Position tiles at the bottom center of the screen
      this.mapTiles = new Tiles(this.gridarray, // 2D array of tiles
          0, // x to centralise map
          0, // y to position at top
          this.cellSize,
          this.cellSize);

      this.mapTiles.visible = false;
      console.log(this.mapTiles)

      this.mapX = 0;//(width / 2) - (this.numCols / 2) * this.cellSize;
      this.mapY = 0;//height - this.numRows * this.cellSize;

      // Obtain the real treasure room
      // this.realTreasureRoomLocation = this.realTreasureRoomLocation;
      this.mapCellSize = this.cellSize;

      // Build map overlays
      // Define props for map overlays
      // this.mapOverlayAreaSprite.collider = 'static';
      // this.mapOverlayAreaSprite.layer = 999;

      // Build map overlay areas
      // let mapOverlayAreas = this.mapOverlayAreas;
      // this.mapOverlayAreas = this.mapOverlayAreas;

      // for (let i = 0; i < mapOverlayAreas.length; i++) {
      //     let mapOverlayArea = mapOverlayAreas[i];
      //     let mapOverlayAreaSprite = new this.mapOverlayAreaSprite.Sprite();

      //     if (mapOverlayArea.collider == "none") {
      //         mapOverlayAreaSprite.overlaps(allSprites);
      //     }

      //     mapOverlayAreaSprite.w = mapOverlayArea.w * this.mapCellSize;
      //     mapOverlayAreaSprite.h = mapOverlayArea.h * this.mapCellSize;
      //     // p5play treats position of rectangle using the center point of the rect, hence this suspicious positioning fix
      //     mapOverlayAreaSprite.x = (mapOverlayArea.x * this.mapCellSize) + this.mapX + (mapOverlayAreaSprite.w / 2) - (this.mapCellSize / 2);
      //     mapOverlayAreaSprite.y = (mapOverlayArea.y * this.mapCellSize) + this.mapY + (mapOverlayAreaSprite.h / 2) - (this.mapCellSize / 2);
      //     mapOverlayAreaSprite.img = mapOverlayArea.img;
      // }

      this.mapBuilt = true;
  }

  random(min, max) {
        let rand;

        rand = Math.random();

        if (typeof min === 'undefined') {
            return rand;
        } else if (typeof max === 'undefined') {
            if (Array.isArray(min)) {
                return min[Math.floor(rand * min.length)];
            } else {
                return rand * min;
            }
        } else {
            if (min > max) {
                const tmp = min;
                min = max;
                max = tmp;
            }

            return rand * (max - min) + min;
        }
    };
  draw_tile(img, x, y, z, graphics, X_start, Y_start) {
    let X_screen = X_start + (x - y) * this.TILE_WIDTH/2;
    let Y_screen = Y_start + (x + y) * this.TILE_HEIGHT/2 - z * this.TILE_HEIGHT/2;
    graphics.image(img, X_screen, Y_screen);
  }
  draw_grid(camx, camy, graphic = this.graphics) {
    let graphics = createGraphics(windowWidth, windowHeight);
    let offsetx = camx - windowWidth / 2;
    let offsety = camy - windowHeight / 2; //scaling needs to be dealt with
    let X_start = width/2 - this.TILE_WIDTH/2 //+ offsetx;
    let Y_start = height/2 - this.GRID_SIZE * this.TILE_HEIGHT/2 //+ offsety;
    //i is x
    for (let i = 0; i < this.GRID_SIZE; i++) {
      let y = 0;
      let x = 0;
      //we assume square grid
      // when i = 0, y can only be 0
      // when i = 1, y can be 0 or 1
      // when i = 2, y can be 0, 1, or 2
      while (i >= y) {
        let image;
        if (this.gridarray[y][i] == "_"){
          image = this.tile_images[66];
        } else if (this.gridarray[y][i] == "x"){
          image = this.tile_images[65];
        } else if (this.gridarray[y][i] == "1"){
          image = this.tile_images[67];
        } else if (this.gridarray[y][i] == "G"){
          image = this.tile_images[68];
        } else if (this.gridarray[y][i] == "-") {
          image = this.tile_images[69]; 
        }
        // console.log(this.grid.get(i + "_" + y).z)
        this.draw_tile(image, i, y, this.grid.get(i + "_" + y).z, graphics, X_start, Y_start);
        y++;
      }
      while (i >= x) {
        let image;
        if (this.gridarray[i][x] == "_"){
          image = this.tile_images[66];
        } else if (this.gridarray[i][x] == "x"){
          image = this.tile_images[65];
        } else if (this.gridarray[i][x] == "1"){
          image = this.tile_images[67];
        } else if (this.gridarray[i][x] == "G"){
          image = this.tile_images[68];
        } else if (this.gridarray[i][x] == "-") {
          image = this.tile_images[69]; 
        }
        this.draw_tile(image, x, i, this.grid.get(x + "_" + i).z, graphics, X_start, Y_start);
        x++;
      }

      // for (let j = 0; j < GRID_SIZE; j++) {
      //   draw_tile(tile_images[grid[j][i]], i, j); //sequential, use while loop now (while x > y, draw_tile, y++ )
      // }
    }
    return graphics;
  }
  displayIso(camx, camy){
    // let newgraphics = createGraphics(windowWidth, windowHeight);
    // this.draw_grid(camx, camy, newgraphics);
    // this.graphics = newgraphics;
    // console.log(this.graphics)
    let offsetx = camx - windowWidth / 2;
    let offsety = camy - windowHeight / 2; //scaling needs to be dealt with
    // console.log(offsetx, offsety)
    this.graphics = this.draw_grid(camx, camy, this.graphics);
    //how to delete prev image? 
    image(this.graphics,  -windowWidth / 2* (this.gridscale - 1) + offsetx,  - windowHeight / 2 * (this.gridscale - 1) + offsety, windowWidth * this.gridscale, windowHeight * this.gridscale);
    // let newGraphics = createGraphics(windowWidth * this.gridscale, windowHeight * this.gridscale);
    // newGraphics.image(this.graphics,  -windowWidth / 2* (this.gridscale - 1), -windowHeight / 2 * (this.gridscale - 1), windowWidth * this.gridscale, windowHeight * this.gridscale);
    // image(this.graphics,  -windowWidth / 2* (this.gridscale - 1),  - windowHeight / 2 * (this.gridscale - 1), windowWidth * this.gridscale, windowHeight * this.gridscale);
  }
  buildIso(camx, camy){
    this.graphics = this.draw_grid(camx, camy);
    // console.log(this.graphics)
  }




  resize(size){
    this.gridscale = size;
  }
}