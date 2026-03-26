function createGrid(rows, cols, drawing) {
  const container = document.querySelector("#grid");
  container.innerHTML = ""; // Clear existing content

  // Set container to grid layout
  container.style.display = "grid";
  container.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
  container.style.gap = "0px";

  // Initialize the 2D logic array
  // This maps the visual DOM to a data structure

  let gridState = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(0));

  for (let location = 0; location < drawing.length; location++) {
    gridbox = drawing[location];
    gridState[gridbox[0]][gridbox[1]] = 1;
  }

  for (let y = 0; y < rows; y++) {
    //let vs var
    for (let x = 0; x < cols; x++) {
      const cell = document.createElement("div");
      cell.className = "grid-cell";

      // Store coordinates in dataset for easy retrieval
      // dataset property allows you to attach custom data to an HTML element, attributes that start with data-
      cell.dataset.x = x;
      cell.dataset.y = y;

      if (gridState[x][y] == 1) {
        // Toggle visual state
        cell.style.backgroundColor = "black";
      } else {
        // Untoggle visual state
        cell.style.backgroundColor = "white";
      }

      container.appendChild(cell);
    }
  }
  return gridState;
}
