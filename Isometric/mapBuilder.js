class Tile{
  constructor(x, y, z, type){
    this.x = x;
    this.y = y;
    this.z = z;
    this.type = type;
  }

}


class Grid{
  constructor(w, h, cellSize){ // width and height in tiles, width is to the right, height is to left cuz isometric
    this.grid = new Map();
    // first, we generate the map
    // then, we build the map into map tiles
    // then, we build the visual map

    this.mapTiles = null;
    this.displayMapTiles = null;

    this.width = w;
    this.GRID_SIZE = w;
    this.height = h;
    this.cellSize = cellSize;
    this.numCols = w;
    this.numRows = h;

    this.gridscale = 1.0;
    this.TILE_WIDTH = cellSize;
    this.TILE_HEIGHT = 16;
    this.TILE_SIDE_LENGTH = cellSize; //(this.TILE_WIDTH**2 + this.TILE_HEIGHT**2)**0.5;


    this.truewidth = this.width * this.TILE_WIDTH;
    this.trueheight = this.height * this.TILE_HEIGHT;
    console.log(this.truewidth, this.trueheight)
    // this.graphics = this.draw_grid(windowWidth/2, windowHeight/2, this.graphics);
    this.xstart = this.truewidth / 2 - this.TILE_WIDTH / 2;
    this.ystart = this.trueheight / 2 - this.GRID_SIZE * this.TILE_HEIGHT / 2;



    // this.tile_images = tile_images;
    this.gridarray = this.generateMapWithCenterRoom(this.width,this.height,8,10);
    // console.log(this.gridarray)
    this.generateMap();
    this.isoarray = this.generateIsometricTileArray();
    // console.log(this.gridarray)
    // for (let i = 0; i < this.width; i++) {
    //   for (let j = 0; j < this.height; j++) {
    //     this.grid.set(i + "_" + j, new Tile(i, j, round(random(0,2)), 0));
    //   }
    // }
    
    // console.log(this.grid, this.width, this.height, this.gridarray)

    



    this.mapDiagram = null;
    this.mapBuilt = false;
    this.mapX = 0;
    this.mapY = 0;

    this.w  = 2;
    this.h = 2;




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
  
    // this.graphics = createGraphics(windowWidth, windowHeight);
    

    this.displayFloorBricks = new Group();
    this.displayWallBricks1 = new Group();
    this.displayBoundaryBricks = new Group();
    this.displayEmptyBricks = new Group();
    this.displayGoldBricks = new Group();

    this.wallColor = '#484848';
    this.pathColor = "#484848";
    this.boundaryColor = "#484848";
    this.goldColor = "#484848";
    
    // three storages for tiles: the map, the mechanics, and the display
  }

  getTile(x, y){ // from the map
    if (this.grid.has(x + "_" + y)){
      return this.grid.get(x + "_" + y);
    } else {
      return null;
    }
    // return this.grid.get(x + "_" + y);
  }
  getTileFromMechanicIndex(x, y){ //based on the index x and y of the tile
    //gets sprite object\
    let tileIndex = x * this.numCols + y;
    return this.mapTiles[tileIndex];
  }

  generateMap(){
    for (let i = 0; i < this.numCols; i++) {
      for (let j = 0; j < this.numRows; j++) {
        this.grid.set(i + "_" + j, new Tile(i, j, round(random(0,2)), this.gridarray[j][i]));
      }
    }
    // console.log(this.grid)
  }
  // temporary generation function for testing
  generateMapWithCenterRoom(mapWidth, mapHeight, treasureRoomWidth, treasureRoomHeight) {
      // Initialize the map with "*" for the outside area.
      let map = Array.from({ length: mapHeight }, () => Array(mapWidth).fill('f'));

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

  generateIsometricTileArray() {
    this.isoarray = Array.from({ length: (this.numCols + this.numRows - 1) }, () => Array(this.numCols + this.numRows - 1).fill('.'));
    let xstart = round((this.numCols + this.numRows - 1) / 2);
    let ystart = 0
    for (let i = 0; i < this.numCols; i++) {
      for (let j = 0; j < this.numRows; j++) {
        this.editIsoTileArray(i, j, this.grid.get(i + "_" + j).type, xstart, ystart);
      }
    }
    this.isoarray = this.isoarray.map(row => row.join('')); 
    // console.log(this.isoarray)
    return this.isoarray;
  }

  editIsoTileArray(x, y, type, xstart, ystart){
    let arrayx = (x - y) + xstart;
    let arrayy = (x + y) + ystart;
    
    if (this.isoarray){
      this.isoarray[arrayy][arrayx] = type;
    }
    // if (arrayy < 5){
    //   console.log(arrayx, arrayy, type, this.isoarray[arrayy])
    // }
    
  }

  getIndexFromIsoArray(x, y){
    let xstart = round((this.numCols + this.numRows - 1) / 2);
    let ystart = 0;
    let arrayx = (x - y) + xstart;
    let arrayy = (x + y) + ystart;
    return arrayx * (this.numCols + this.numRows - 1) + arrayy;
  }

  findFromCoords(x,y){
    let xstart = round((this.numCols + this.numRows - 1) / 2) * this.TILE_WIDTH / 2;
    let ystart = 0;
    let coordx = (y / this.TILE_HEIGHT) - (ystart / this.TILE_HEIGHT) + (x / this.TILE_WIDTH) - (xstart / this.TILE_WIDTH);
    let coordy = coordx + (2 * xstart) / this.TILE_WIDTH -  (2 * x) / this.TILE_WIDTH;
    // console.log(coordx, coordy, x, y, xstart, ystart)
    return createVector(coordx, coordy);
  }


  buildMap() { // out of use
    // Leveraging p5play mechanics to manage player movement

      // Clear existing map before building
      if (this.mapTiles != null) {
          this.mapTiles.removeAll();
      }

      // this.numCols = this.numCols;
      // this.numRows = this.numRows;
      // this.mapDiagram = createGraphics(this.numCols * this.w, this.numRows * this.h);

      // Construct map based on this from server side


      this.floorBricks.w = this.TILE_SIDE_LENGTH; // Width of each brick
      this.floorBricks.h = this.TILE_SIDE_LENGTH; // Height of each brick
      this.floorBricks.tile = "f";
      // this.floorBricks.color = this.wallColor;
      this.floorBricks.collider = 'static';
      // this.floorBricks.stroke = this.wallColor;
      this.floorBricks.overlaps(allSprites);
      // this.floorBricks.layer = 990;
    //   this.floorBricks.img = "./textures/wall.png";

      this.wallBricks1.w = this.TILE_SIDE_LENGTH;
      this.wallBricks1.h = this.TILE_SIDE_LENGTH;
      this.wallBricks1.tile = "1";
      // this.wallBricks1.color = this.pathColor;
      this.wallBricks1.collider = 'static';
      // this.wallBricks1.stroke = this.pathColor;
      // this.wallBricks1.layer = 990;
    //   this.wallBricks1.img = "./textures/path.png";

      this.boundaryBricks.w = this.TILE_SIDE_LENGTH;
      this.boundaryBricks.h = this.TILE_SIDE_LENGTH;
      this.boundaryBricks.tile = "x";
      // this.boundaryBricks.color = this.boundaryColor;
      this.boundaryBricks.collider = 'static';
      // this.boundaryBricks.stroke = this.boundaryColor;
      // this.boundaryBricks.layer = 990;
    //   this.boundaryBricks.img = "./textures/boundary.png";

      this.goldBricks.w = this.TILE_SIDE_LENGTH;
      this.goldBricks.h = this.TILE_SIDE_LENGTH;
      this.goldBricks.tile = "G";
      // this.goldBricks.color = this.goldColor;
      this.goldBricks.collider = 'static';
      // this.goldBricks.stroke = this.goldColor;
      this.goldBricks.overlaps(allSprites);
      // this.goldBricks.layer = -999;
    //   this.goldBricks.img = "./textures/gold.png";

      this.emptyBricks.w = this.TILE_SIDE_LENGTH;
      this.emptyBricks.h = this.TILE_SIDE_LENGTH;
      this.emptyBricks.tile = "-";
      // this.emptyBricks.color = "#484848";
      this.emptyBricks.collider = 'static';
      // this.emptyBricks.stroke = "#484848";
      this.emptyBricks.overlaps(allSprites);
      // this.emptyBricks.layer = -999;
    //   this.emptyBricks.img = "./textures/empty.png";

      // Position tiles at the bottom center of the screen
      this.mapTiles = new Tiles(this.gridarray, // 2D array of tiles
          0, // x to centralise map
          0, // y to position at top
          this.TILE_SIDE_LENGTH,
          this.TILE_SIDE_LENGTH);

      this.mapTiles.visible = false;
      // console.log(this.mapTiles)

      this.mapX = 0;//(width / 2) - (this.numCols / 2) * this.cellSize;
      this.mapY = 0;//height - this.numRows * this.cellSize;

      // Obtain the real treasure room
      // this.realTreasureRoomLocation = this.realTreasureRoomLocation;
      this.mapCellSize = this.TILE_SIDE_LENGTH;

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

  buildVisualMap() {
    // using p5play to display the map
    // Draw the map in isometric view
    //remove sprites in the display group
    // for (let i = 0; i < this.displayMapTiles.length; i++) {
    //   this.displayMapTiles[i].remove();
    // }
    // this.displayMapTiles = [];

    if (this.displayMapTiles != null) {
      this.displayMapTiles.removeAll();
    }

    this.displayFloorBricks.w = this.TILE_WIDTH; // Width of each brick
    this.displayFloorBricks.h = this.TILE_HEIGHT; // Height of each brick
    this.displayFloorBricks.tile = "f";
    // this.displayFloorBricks.color = this.wallColor;
    this.displayFloorBricks.collider = 'static';
    // this.displayFloorBricks.stroke = this.wallColor;
    this.displayFloorBricks.overlaps(allSprites);
    this.displayFloorBricks.layer = -990;
    this.displayFloorBricks.img = './new_tileset/tile_066.png';

    this.displayWallBricks1.w = this.TILE_WIDTH;
    this.displayWallBricks1.h = this.TILE_HEIGHT
    this.displayWallBricks1.tile = "1";
    // this.displayWallBricks1.color = this.pathColor;
    this.displayWallBricks1.collider = 'static';
    // this.displayWallBricks1.stroke = this.pathColor;
    // this.displayWallBricks1.overlaps(allSprites);
    this.displayWallBricks1.layer = 990;
    this.displayWallBricks1.img = './new_tileset/tile_067.png';

    this.displayBoundaryBricks.w = this.TILE_WIDTH;
    this.displayBoundaryBricks.h = this.TILE_HEIGHT;
    this.displayBoundaryBricks.tile = "x";
    // this.displayBoundaryBricks.color = this.boundaryColor;
    this.displayBoundaryBricks.collider = 'static';
    // this.displayBoundaryBricks.stroke = this.boundaryColor;
    // this.displayBoundaryBricks.overlaps(allSprites);
    this.displayBoundaryBricks.layer =-990;
    this.displayBoundaryBricks.img = './new_tileset/tile_065.png';

    this.displayGoldBricks.w = this.TILE_WIDTH;
    this.displayGoldBricks.h = this.TILE_HEIGHT;
    this.displayGoldBricks.tile = "G";
    // this.displayGoldBricks.color = this.goldColor;
    this.displayGoldBricks.collider = 'static';
    // this.displayGoldBricks.stroke = this.goldColor;
    this.displayGoldBricks.overlaps(allSprites);
    this.displayGoldBricks.layer = -999;
    this.displayGoldBricks.img = './new_tileset/tile_068.png';

    this.displayEmptyBricks.w = this.TILE_WIDTH;
    this.displayEmptyBricks.h = this.TILE_HEIGHT;
    this.displayEmptyBricks.tile = "-";
    // this.displayEmptyBricks.color = "#484848";
    this.displayEmptyBricks.collider = 'static';
    // this.displayEmptyBricks.stroke = "#484848";
    this.displayEmptyBricks.overlaps(allSprites);
    this.displayEmptyBricks.layer = -999;
    this.displayEmptyBricks.img = './new_tileset/tile_069.png';

    this.displayMapTiles = new Tiles(this.isoarray, // 2D array of tiles
        0, // x to centralise map
        0, // y to position at top
        this.TILE_WIDTH / 2,
        this.TILE_HEIGHT / 2);
    // this.mapTiles.collider = 'none';

    console.log(this.displayMapTiles)


    for (let i = 0; i < this.displayMapTiles.length; i++) {
      let tile = this.displayMapTiles[i]; //sprite object
      let vect = this.findFromCoords(tile.pos.x, tile.pos.y);
      let z = this.getTile(vect.x, vect.y).z;
      if (z != 0){
        // tile.pos.y -= z * this.TILE_HEIGHT / 2;
      }
    }


    // for (let i = 0; i < this.numCols; i++) { //x 
    //     for (let j = 0; j < this.numRows; j++) { // y
    //       let tile = this.getTile(i, j);
    //       if (tile != null) {
    //         // console.log(43)
    //         let displayTile;
    //         if (tile.type == "f") {
    //           displayTile = new this.displayFloorBricks.Sprite();
    //         } else if (tile.type == "1") {
    //             displayTile = new this.displayWallBricks1.Sprite();
    //         } else if (tile.type == "x") {
    //             displayTile = new this.displayBoundaryBricks.Sprite();
    //         } else if (tile.type == "G") {
    //             displayTile = new this.displayGoldBricks.Sprite();
    //         } else if (tile.type == "-") {
    //             displayTile = new this.displayEmptyBricks.Sprite();
    //         } else {
    //             displayTile = new this.displayEmptyBricks.Sprite();
    //         }
    //         displayTile.pos.x = this.xstart + (i - j) * this.TILE_WIDTH/2;//i * this.cellSize + (j * this.cellSize / 2);
    //         displayTile.pos.y = this.ystart + (i + j) * this.TILE_HEIGHT/2 - tile.z * this.TILE_HEIGHT/2; 
    //         // j * this.cellSize / 2 - i * this.cellSize / 2;
    //         this.displayMapTiles.push(displayTile); 
    //       }
    //       // console.log(tile)
          
    //   }

    // }
    // console.log(" displayer",this.displayMapTiles)
  }


  getDisplayTile(x, y){
    return this.displayMapTiles[x * this.numCols + y];
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
  draw_tile(img, x, y, z, graphics, X_start, Y_start) { // out of use
    let X_screen = X_start + (x - y) * this.TILE_WIDTH/2;
    let Y_screen = Y_start + (x + y) * this.TILE_HEIGHT/2 - z * this.TILE_HEIGHT/2;
    graphics.image(img, X_screen, Y_screen);
  }
  draw_grid(camx, camy, graphic = this.graphics) { // out of use
    let graphics = createGraphics(this.truewidth, this.trueheight);
    let offsetx = camx - this.truewidth / 2;
    let offsety = camy - this.trueheight / 2; //scaling needs to be dealt with
    let X_start = this.truewidth/2 - this.TILE_WIDTH/2 //+ offsetx;
    let Y_start = this.trueheight/2 - this.GRID_SIZE * this.TILE_HEIGHT/2 //+ offsety;
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
  displayIso(camx, camy, camscale){ // out of use
    this.gridscale = camscale;
    // let newgraphics = createGraphics(windowWidth, windowHeight);
    // this.draw_grid(camx, camy, newgraphics);
    // this.graphics = newgraphics;
    // console.log(this.graphics)
    let offsetx = (camx - windowWidth / 2) * this.gridscale; //scaling needs to be dealt with
    let offsety = (camy - windowHeight / 2) * this.gridscale; //scaling needs to be dealt with
    // console.log(offsetx, offsety)
    this.graphics = this.draw_grid(camx, camy, this.graphics);
    //how to delete prev image? 
    this.xstart = (this.truewidth / 2 - this.TILE_WIDTH / 2) * this.gridscale + offsetx;
    this.ystart = (this.trueheight / 2 - this.GRID_SIZE * this.TILE_HEIGHT / 2) * this.gridscale + offsety; 
    image(this.graphics,  - 1 / 2* (this.gridscale * this.truewidth - windowWidth) + offsetx,  - 1 / 2 * (this.gridscale * this.trueheight - windowHeight) + offsety, this.truewidth * this.gridscale, this.trueheight * this.gridscale);
    // let newGraphics = createGraphics(windowWidth * this.gridscale, windowHeight * this.gridscale);
    // newGraphics.image(this.graphics,  -windowWidth / 2* (this.gridscale - 1), -windowHeight / 2 * (this.gridscale - 1), windowWidth * this.gridscale, windowHeight * this.gridscale);
    // image(this.graphics,  -windowWidth / 2* (this.gridscale - 1),  - windowHeight / 2 * (this.gridscale - 1), windowWidth * this.gridscale, windowHeight * this.gridscale);
  }
  buildIso(camx, camy){ // out of use
    this.graphics = this.draw_grid(camx, camy);
    // console.log(this.graphics)
  }




  resize(size){
    this.gridscale = size;
  }
  setPlayerPosition(servermap, player){
    // console.log(player)
    player.pos.x = this.numCols/2 * this.TILE_SIDE_LENGTH;
    player.pos.y = this.numRows/2 * this.TILE_HEIGHT;
  }
}

function createPlayerSprite(name) {
    let mechanicSprite = new Sprite(0, 0, 10);
    return mechanicSprite;
    // mechanicSprite.visible = true;
    // mechanicSprite.collider = 'static';
    // mechanicSprite.overlaps(allSprites);

    // Load sprite sheet
    // playerSprite.spriteSheet = "./images/textures/dwarf-sprite-sheet.png";
    // playerSprite.anis.offset.y = -4;
    // playerSprite.anis.frameDelay = 2;
    // playerSprite.addAnis({
    //     idle: {row: 0, frames: 5, w: 64, h: 32},
    //     run: {row: 1, frames: 8, w: 64, h: 32},
    // });
    // playerSprite.anis.scale = 2;

    // // Manually draw the ign by overriding the draw function
    // // Taking reference from https://github.com/quinton-ashley/p5play/blob/main/p5play.js
    // playerSprite.draw = () => {
    //     fill("white");
    //     textAlign(CENTER, CENTER);
    //     textSize(16);
    //     text(name, 0, -35);

    //     playerSprite.ani.draw(playerSprite.offset.x, playerSprite.offset.y, 0, playerSprite.scale.x, playerSprite.scale.y);
    // }


    
}

function createVisiblePlayerSprite(mechanicSprite, name, map) {
    let playerSprite = new Sprite(0, 0, 32, 32);
    playerSprite.visible = true;
    playerSprite.collider = 'none';
    // Load sprite sheet
    // playerSprite.spriteSheet = mechanicSprite;
    // playerSprite.anis.offset.y = -4;
    // playerSprite.anis.frameDelay = 2;
    // playerSprite.addAnis({
    //     idle: {row: 0, frames: 5, w: 64, h: 32},
    //     run: {row: 1, frames: 8, w: 64, h: 32},
    // });
    // playerSprite.anis.scale = 2;

    // Manually draw the ign by overriding the draw function
    // Taking reference from
    playerSprite.draw = () => {
        
        fill("white");
        textAlign(CENTER, CENTER);
        textSize(16);
        text(name, 0, -35);

        circle(0, 0, 32);
        rect(10, 0, 32, 50);

        // playerSprite.ani.draw(playerSprite.offset.x, playerSprite.offset.y, 0, playerSprite.scale.x, playerSprite.scale.y);
    }
    return playerSprite;

}