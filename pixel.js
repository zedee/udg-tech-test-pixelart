'use strict';

window.onload = (ev) => {
  //Handler for the canvas operations
  const handleCanvasClick = (ev) => {
    //Get absolute position respect to canvas
    const x = ev.clientX - mainCanvas.canvasElement.offsetLeft;
    const y = ev.clientY - mainCanvas.canvasElement.offsetTop;

    //We only have two tools (brush and bucket) so a simple else/if suffice
    if (selectedTool == "pencil") {
      let foundCellIndex = mainCanvas.grid.findIndex(cell => {
        return (
          x <= (cell.posX + cell.width) && y <= (cell.posY + cell.width)
          );
      });
      if (foundCellIndex >= 0) {
        mainCanvas.grid[foundCellIndex].fillColor = mainCanvas.selectedColor;
        mainCanvas.drawGrid();
      }
    } else {
        //TODO: bucket painting tool logic
    }
  }

  //Set the brush/bucket color
  const handlePaletteColorChange = (ev) => {
    mainCanvas.selectedColor = ev.detail.color;
  }

  //When window resizes, readapt and redraw everything
  const handleWindowResize = () => {
    //TODO: set wrapper w/h, as with some sizes this comes a bit unbereable to use
    mainCanvas.width = document.querySelector("#wrapper").offsetWidth;
    mainCanvas.height = document.querySelector("#wrapper").offsetWidth;
    mainCanvas.canvasElement.width = document.querySelector("#wrapper").offsetWidth;
    mainCanvas.canvasElement.height = document.querySelector("#wrapper").offsetWidth;
    mainCanvas.updateGrid();
    mainCanvas.drawGrid();
  }

  //Grid resolution size change
  const handleGridSize = (ev) => {
    if (mainCanvas.gridSize != ev.target.dataset.gridSize) {
      mainCanvas.gridSize = ev.target.dataset.gridSize;
      mainCanvas.updateGrid(true);
      mainCanvas.drawGrid();
    }
  }
  
  //Init palette and main drawing canvas
  const palette = createPalette("#row-palette");
  const mainCanvas = new MainCanvas("#main-canvas", 8);
  const sizeControls = document.querySelectorAll("#col-controls-size-select button");
  const selectedTool = "pencil";

  //Add eventListeners to our elements
  mainCanvas.canvasElement.addEventListener("click", handleCanvasClick, false);  
  palette.addEventListener("colorChange", handlePaletteColorChange, false);
  sizeControls.forEach(element => {
    element.addEventListener("click", handleGridSize, false);
  });
  window.addEventListener("resize", handleWindowResize, false);  
}

function MainCanvas (domElementId, gridSize) {
  this.domElementId = domElementId || "#canvas";
  this.canvasElement = document.querySelector(this.domElementId);
  this.context = this.canvasElement.getContext('2d');
  this.gridSize = gridSize || 8;
  this.width = document.querySelector("#wrapper").offsetWidth;
  this.height = document.querySelector("#wrapper").offsetWidth;
  this.gridBorderColor = "#000";
  this.grid = [];
  this.selectedColor = "#000";

  this.init = function() {
    this.canvasElement.width = this.width;
    this.canvasElement.height = this.height;

    this.createGrid = function() {
      for (let i = 0; i < this.gridSize; i++) {
        for (let j = 0; j < this.gridSize; j++) {
          this.grid.push(new Cell(
            this.width / this.gridSize, 
            this.width / this.gridSize,
            ((this.width / this.gridSize * j) % this.width),
            ((this.width / this.gridSize * i) % this.width)
          ))
        }
      }
    }

    //Scaling function when window is resized
    this.updateGrid = function(resizeDensity) {
      if (resizeDensity) {
        /*
         * By now, let's just erase the current drawing. While it'd possible 
         * to save and set the already drawn pixels if the user wants to 
         * upscale the resolution (via matrix transpose for instance),
         * it'd be a bit more complex to go the other way (downscaling), as 
         * some kind of interpolation should be done in order to keep the most
         * significant information after decreasing the density. This is not
         * a requirement, so i'll keep the most simple implementation.
         */
        const userAcceptsDelete = 
          confirm("Warning, changing the grid density will erase the current drawing, are you sure?");
        if (userAcceptsDelete) {
          this.grid = [];
          this.createGrid();
        }
      } else {
        let yIndex = 0;
        this.grid.forEach((cell, index) => {
          if (index !== 0 && index % this.gridSize == 0) {
            yIndex++;
          }
          cell.width = this.width / this.gridSize; 
          cell.height = this.width / this.gridSize;
          cell.posX = ((this.width / this.gridSize * (index % this.gridSize)) % this.width);
          cell.posY = ((this.width / this.gridSize * yIndex)) % this.width;
        });
      }
    }

    //Grid (re)draw function
    this.drawGrid = () => this.grid.forEach(cell => {
      this.context.fillStyle = cell.fillColor;
      this.context.strokeStyle = this.gridBorderColor;
      this.context.strokeRect(cell.posX, cell.posY, cell.width, cell.width);
      this.context.fillRect(cell.posX, cell.posY, cell.width, cell.width);
    });

    this.createGrid();
    this.drawGrid();
  }

  this.init();
}

//We assume it's a square cell
function Cell (width, height, posX, posY, fillColor) {
  this.width = width || 0;
  this.posX = posX || 0;
  this.posY = posY || 0;
  this.fillColor = fillColor || "#FFF";
}

function createPalette (targetElementId) {
  const colorPalette = {
    default: [
      "#0C46FA",
      "#0BD9C6",
      "#00F001",
      "#FFF600",
      "#FCA70D",
      "#F50076",
      "#5D00E5",
      "#0D79FD",      
      "#FFFFFF",
      "#808080",
      "#000000"
    ]
  };

  const paletteWrapperElement = document.querySelector(targetElementId);
  
  //Color change handler
  const handleColorChange = (ev) => {
    const allColorsSelector = document.querySelectorAll(".palette-color");

    //Remove all 'selected' classes
    allColorsSelector.forEach(colorElement => {
      colorElement.className = "palette-color";
    });
    //Add 'selected' class to the selected color
    ev.target.className = "palette-color" + " selected";

    const event = new CustomEvent("colorChange", {
      detail: {
        color: ev.target.dataset.color
      }      
    });
    paletteWrapperElement.dispatchEvent(event);
  }

  //Create palette element
  for (let i = 0; i < colorPalette.default.length; i++) {
    const paletteColor = document.createElement('div');
    paletteColor.className = "palette-color";
    paletteColor.dataset.color = colorPalette.default[i];
    paletteColor.style.backgroundColor = colorPalette.default[i];
    paletteColor.addEventListener("click", handleColorChange, false);
    paletteWrapperElement.appendChild(paletteColor);    
  }

  return paletteWrapperElement;
}