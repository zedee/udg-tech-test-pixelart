window.onload = (ev) => {
  const handleCanvasClick = (ev) => {
    const x = ev.clientX - mainCanvas.canvasElement.offsetLeft;
    const y = ev.clientY - mainCanvas.canvasElement.offsetTop;
    console.log(x,y);
    let foundCellIndex = mainCanvas.grid.findIndex(cell => {
      return (
        x <= (cell.posX + cell.width) && y <= (cell.posY + cell.height)
        );
    });
    if (foundCellIndex >= 0) {
      mainCanvas.grid[foundCellIndex].fillColor = "#000";
      mainCanvas.drawGrid();
    }
  }

  const mainCanvas = new MainCanvas("main-canvas", 8);
  mainCanvas.canvasElement.addEventListener("click", handleCanvasClick, false);
}

function MainCanvas (domElementId, gridSize) {
  this.domElementId = domElementId || "canvas";
  this.gridSize = gridSize || 8;
  this.width = 400;
  this.height = 400;
  this.gridBorderColor = "#000";
  this.canvasElement = document.getElementById(this.domElementId);
  this.context = this.canvasElement.getContext('2d');
  this.grid = [];

  this.init = function() {
    this.canvasElement.width = this.width;
    this.canvasElement.height = this.height;
    this.createGrid = function() {
      for (let i = 0; i < this.gridSize; i++) {
        for (let j = 0; j < this.gridSize; j++) {
          this.grid.push(new Cell(
            Math.ceil(this.width / this.gridSize), 
            Math.ceil(this.height / this.gridSize),
            (Math.ceil(this.width / this.gridSize) * j) % this.width,
            (Math.ceil(this.height / this.gridSize * i)) % this.height)
            );
        }
      }
    }

    this.getGrid = () => this.grid;

    this.drawGrid = () => this.grid.forEach(cell => {
      this.context.fillStyle = cell.fillColor;
      this.context.strokeStyle = this.gridBorderColor;
      this.context.strokeRect(cell.posX, cell.posY, cell.width, cell.height);
      this.context.fillRect(cell.posX, cell.posY, cell.width, cell.height);
    });

    this.createGrid();
    this.drawGrid();
  }

  this.init();
  console.log(this.grid);
}

function Cell (width, height, posX, posY) {
  this.width = width || 0;
  this.height = height || 0;
  this.posX = posX || 0;
  this.posY = posY || 0;
  this.fillColor = "#FFF";
}

function Palette () {
  this.colors = [];
  this.selectedColor = "0xFF";
}