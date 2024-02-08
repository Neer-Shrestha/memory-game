window.addEventListener("DOMContentLoaded", () => {
  let PLAYERS_COUNT,
    IS_SOLO = false,
    CPU_MEMORY = [],
    GRID,
    GRID_SIZE,
    PLAYERS,
    STACK = [],
    CLICK_COUNT = 0,
    CURRENT_PLAYER_ID;

  const optionForm = document.querySelector(".option-form");
  const board = document.querySelector(".grid");
  const footer = document.querySelector(".footer");
  const restartBtn = document.querySelectorAll(".btn-restart");
  const newGameBtn = document.querySelectorAll(".btn-new");

  restartBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      PLAYERS_COUNT = parseInt(
        optionForm.querySelector('[name="players"]:checked')?.value
      );
      board.classList.remove(`col-${GRID}`);
      GRID = parseInt(
        optionForm.querySelector('[name="grid_size"]:checked')?.value
      );
      board.parentElement.classList.remove(`disabled`);

      startGame(PLAYERS_COUNT, GRID);
    });
  });

  newGameBtn.forEach((btn) => {
    btn.addEventListener("click", newGame);
  });

  optionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    PLAYERS_COUNT = parseInt(
      optionForm.querySelector('[name="players"]:checked')?.value
    );
    board.classList.remove(`col-${GRID}`);
    GRID = parseInt(
      optionForm.querySelector('[name="grid_size"]:checked')?.value
    );

    startGame(PLAYERS_COUNT, GRID);
  });

  function startGame(PLAYERS_COUNT, GRID) {
    GRID_SIZE = GRID * GRID;

    board.classList.add(`col-${GRID}`);
    CLICK_COUNT = 0;
    clearBoard();
    clearStack();
    initBoard(GRID_SIZE);
    initPlayer(PLAYERS_COUNT);
  }

  function newGame() {
    document.querySelector(".result").classList.add("hide");
    document.querySelector(".game-board").classList.add("hide");
    document.querySelector(".option-form").classList.remove("hide");
  }

  function initBoard(size) {
    optionForm.classList.add("hide");
    document.querySelector(".game-board").classList.remove("hide");
    document.querySelector(".result").classList.add("hide");

    const length = size / 2;

    const numArr = Array.from({ length: length }, (_, i) => i + 1);

    const data = [...numArr, ...numArr];

    suffleArray(data);
    addButtons(data);
  }

  function addButtons(data) {
    data.forEach((num, i) => {
      const button = document.createElement("button");

      button.addEventListener("click", (e) => {
        let exitsInArray = false;
        button.innerHTML = num;
        button.classList.add("active");
        button.classList.add("disabled");

        const stackData = {
          num,
          index: i,
        };

        STACK.push(stackData);

        CPU_MEMORY.forEach((memory) => {
          if (memory.index == stackData.index && memory.num == stackData.num) {
            exitsInArray = true;
            return;
          }
        });

        if (!exitsInArray) {
          updateCpuMemory(stackData);
        }

        if (STACK.length == 2) {
          checkMatch();
        }

        CLICK_COUNT += 1;
      });

      board.appendChild(button);
    });
  }

  function calculateWinPercent(currentPlayer) {
    currentPlayer.correct_percent =
      (currentPlayer.correct / currentPlayer.num_of_click) * 100;
  }

  function isOver() {
    const correctArr = PLAYERS.map((player) => player.correct);
    const totalCorrect = correctArr.reduce(
      (total, value, _i, arr) => total + value
    );

    if (totalCorrect == (GRID * GRID) / 2) {
      return true;
    }

    return false;
  }

  function showResult() {
    document.querySelector(".game-board").classList.add("hide");
    document.querySelector(".result").classList.remove("hide");

    const result = document.querySelector(".result");
    const details = result.querySelector(".details");

    const winPercentArr = PLAYERS.map((player) => player.correct_percent);
    const maxCorrect = Math.max(...winPercentArr);
    const winnerIndex = winPercentArr.indexOf(maxCorrect);
    let secondMaxCorrectIndex = winPercentArr.indexOf(
      maxCorrect,
      winnerIndex + 1
    );

    if (maxCorrect == winPercentArr[secondMaxCorrectIndex]) {
      result.querySelector(
        "h2"
      ).innerHTML = `${PLAYERS[winnerIndex].name} and ${PLAYERS[secondMaxCorrectIndex].name}  Wins!`;
    } else {
      result.querySelector("h2").innerHTML =
        PLAYERS[winnerIndex].name + " Wins!";
      secondMaxCorrectIndex = null;
    }

    details.innerHTML = "";

    PLAYERS.forEach((player, idx) => {
      const item = document.createElement("div");
      item.classList.add("item");

      if (idx == winnerIndex || idx == secondMaxCorrectIndex) {
        item.classList.add("winner");
      }

      item.innerHTML = `${player.name} <span>${
        player.correct
      } Pair<br> ${player.correct_percent.toFixed(2)}% Win rate</span>`;

      details.appendChild(item);
    });
  }

  function clearStack() {
    STACK = [];
  }

  function switchTurn() {
    document
      .querySelector(`.footer span:nth-child(${CURRENT_PLAYER_ID}`)
      .classList.remove("active");
    if (CURRENT_PLAYER_ID == PLAYERS_COUNT) {
      CURRENT_PLAYER_ID = 1;
    } else {
      CURRENT_PLAYER_ID += 1;
    }
    document
      .querySelector(`.footer span:nth-child(${CURRENT_PLAYER_ID}`)
      .classList.add("active");

    // Checking if Player name is CPU
    checkIfCPU();
  }

  function checkIfCPU() {
    if (PLAYERS[CURRENT_PLAYER_ID - 1].name == "CPU") {
      board.parentElement.classList.add("disabled");

      cpuTurn();
    } else {
      board.parentElement.classList.remove("disabled");
    }
  }

  function cpuTurn() {
    let cpuClickCount = 0;
    const pairElements = checkPair();
    const interval = setInterval(() => {
      if (cpuClickCount == 1) {
        let isFound = false;
        let foundIndex = null;

        CPU_MEMORY.forEach((memory) => {
          if (memory.num == STACK[0].num && memory.index != STACK[0].index) {
            isFound = true;
            foundIndex = memory.index;
          }
        });

        if (isFound) {
          cpuClick(foundIndex);
        } else {
          cpuClick();
        }

        clearInterval(interval);
      } else {
        cpuClick();
        cpuClickCount += 1;
      }
    }, 500);
    setTimeout(() => {
      clearInterval(interval);
    }, 1000);
  }

  function checkPair() {
    const memory_nums = CPU_MEMORY.map((memory) => memory.num);
    const memory_index = CPU_MEMORY.map((memory) => memory.index);

    return [];
  }

  function checkMatch() {
    const currentPlayer = PLAYERS[CURRENT_PLAYER_ID - 1];
    const elm1 = document.querySelector(
      `.grid button:nth-child(${STACK[0].index + 1})`
    );
    const elm2 = document.querySelector(
      `.grid button:nth-child(${STACK[1].index + 1})`
    );

    currentPlayer.num_of_click += 1;

    if (STACK[0].num == STACK[1].num) {
      elm1.classList.remove("active");
      elm2.classList.remove("active");
      elm1.classList.add("match");
      elm2.classList.add("match");
      clearStack();

      currentPlayer.correct += 1;
      calculateWinPercent(currentPlayer);
      document.querySelector(
        `.player[data-id="${CURRENT_PLAYER_ID}"] strong`
      ).textContent = currentPlayer.correct;
      checkIfCPU();
      if (isOver()) {
        showResult();
      }
    } else {
      board.classList.add("disabled");
      setTimeout(() => {
        elm1.innerHTML = "";
        elm1.classList.remove("active");
        elm1.classList.remove("disabled");
        elm2.innerHTML = "";
        elm2.classList.remove("active");
        elm2.classList.remove("disabled");
        clearStack();

        currentPlayer.incorrect += 1;
        calculateWinPercent(currentPlayer);
        switchTurn();
        board.classList.remove("disabled");
      }, 1000);
    }
  }

  function updateCpuMemory(data) {
    CPU_MEMORY.push(data);
  }

  function cpuClick(index = null) {
    if (isOver()) {
      return;
    }

    if (index != null) {
      const button = document.querySelector(
        `.grid button:nth-child(${index + 1})`
      );

      button.click();
    } else {
      const buttons = document.querySelectorAll(
        ".grid button:not(.active):not(.disabled)"
      );

      const cpu_click_element = getRandomNumber(buttons.length - 1);

      buttons[cpu_click_element].click();
    }
  }

  function suffleArray(arr) {
    for (let i = 0; i < arr.length; i++) {
      const randomIndex = getRandomNumber(arr.length - 1);
      const temp = arr[i];
      arr[i] = arr[randomIndex];
      arr[randomIndex] = temp;
    }
  }

  function getRandomNumber(size) {
    return Math.round(Math.random() * size);
  }

  function clearBoard() {
    board.innerHTML = "";
  }

  function initPlayer(playerCount) {
    PLAYERS = Array.from({ length: playerCount }, (_, i) => ({
      id: i + 1,
      name: "Player " + (i + 1),
      num_of_click: 0,
      correct: 0,
      incorrect: 0,
      correct_percent: 0,
    }));

    if (playerCount == 1) {
      IS_SOLO = true;
      PLAYERS_COUNT += 1;

      PLAYERS.push({
        id: 2,
        name: "CPU",
        num_of_click: 0,
        correct: 0,
        incorrect: 0,
        correct_percent: 0,
      });
    }

    footer.innerHTML = "";

    PLAYERS.forEach((player) => {
      const player_element = document.createElement("span");
      const score = document.createElement("strong");
      score.innerHTML = player.correct;
      player_element.setAttribute("data-id", player.id);
      player_element.innerHTML = player.name;
      player_element.classList.add("player");
      player_element.appendChild(score);

      footer.appendChild(player_element);
    });

    CURRENT_PLAYER_ID = PLAYERS[0].id;
    document
      .querySelector(`.footer span:nth-child(${CURRENT_PLAYER_ID}`)
      .classList.add("active");
  }
});
