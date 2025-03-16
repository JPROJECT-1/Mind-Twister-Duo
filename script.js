let myid;
function generateRandomID(length = 9) {
  let idls = localStorage.getItem("mtdid");
  if (!idls) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "";
    for (let i = 0; i < length; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    localStorage.setItem("mtdid", id);
    myid = id;
  } else {
    myid = idls;
  }
}

function start(num) {
  const start = document.getElementById("start");
  const btns1 = document.getElementById("btns1");
  const btns2 = document.getElementById("btns2");
  const host = document.getElementById("host");
  const client = document.getElementById("client");
  start.classList.add("n");
  btns1.classList.add("n");
  btns2.classList.add("n");
  host.classList.add("n");
  client.classList.add("n");
  if (num === 1) {
    start.classList.remove("n");
    btns2.classList.remove("n");
    myrole = "";
    myroom = "";
  } else if (num === 2) {
    hostf();
    host.classList.remove("n");
  } else if (num === 3) {
    clientf();
    client.classList.remove("n");
  } else if (num === 4) {
    start.classList.remove("n");
    btns1.classList.remove("n");
    myrole = "";
    myroom = "";
  }
}

function exit() {
  window.close();
}

let myroom;
let myrole;
function hostf() {
  const nroom = document.getElementById("nroom");
  const json = "Room-" + myid;
  roomData = {
    name: "Room-" + myid,
    player: [myid],
    play: false,
    game: {
      numdt: 0,
      correct: 0,
      done: false,
      duration: 0,
    },
    dt: datapick,
  };
  myroom = json;
  nroom.innerText = "Room-" + myid;
  myrole = "host";
  addRoom("Room-" + myid, roomData);
}
function clientf() {
  myrole = "client";
  const parent = document.getElementById("btnlist");
  parent.innerHTML = "";
  Object.entries(roomfb).forEach(([key, value]) => {
    const btn = document.createElement("button");
    btn.textContent = value.name;
    btn.className = "btn";
    btn.addEventListener("click", () => joinroom(value.name));
    const br = document.createElement("br");
    parent.appendChild(btn);
    parent.appendChild(br);
  });
}

let jr;
function joinroom(vn) {
  Object.entries(roomfb).forEach(([key, value]) => {
    if (value.name === vn) {
      let data = value;
      data.player.push(myid);
      updateRoom(vn, data);
      const client = document.getElementById("client");
      const loading = document.getElementById("loading");
      const nroom1 = document.getElementById("nroom1");
      client.classList.add("n");
      loading.classList.remove("n");
      nroom1.innerText = vn;
      jr = vn;
      datapick = data.dt;
    }
  });
}

function hoststart() {
  Object.entries(roomfb).forEach(([key, value]) => {
    if (value.name === myroom) {
      let data = value;
      data.play = true;
      updateRoom(myroom, data);
    }
  });
}

let datapick;
let datapickm;
function getRandomNumber(type, usedNumbers) {
  let max = type === "extreme" ? 19 : 30;
  let num;

  do {
    num = Math.floor(Math.random() * max) + 1;
  } while (usedNumbers.has(num)); // Cek apakah angka sudah digunakan

  usedNumbers.add(num); // Tandai angka sebagai digunakan
  return num;
}

function generateDataPick(count) {
  const types = ["easy", "medium", "hard", "extreme"];
  let datapick = [];
  let usedNumbers = new Set(); // Simpan angka yang sudah digunakan

  for (let i = 0; i < count; i++) {
    let type = types[Math.floor(Math.random() * types.length)]; // Pilih tipe secara acak
    let num = getRandomNumber(type, usedNumbers);
    datapick.push({ type, num });
  }

  datapickm = datapick;
  generateDataPicks(datapick);
}

function generateDataPicks(datas) {
  let datapicks = [];

  for (let i = 0; i < datas.length; i++) {
    let dt;
    if (datas[i].type === "easy") dt = data.easy[datas[i].num];
    else if (datas[i].type === "medium") dt = data.medium[datas[i].num];
    else if (datas[i].type === "hard") dt = data.hard[datas[i].num];
    else if (datas[i].type === "extreme") dt = data.extreme[datas[i].num];
    datapicks.push(dt);
  }

  datapick = datapicks;
}

let currentQuestionIndex = 0;
let timeLeft = 30;
const questionElement = document.getElementById("question");
const answersElement = document.getElementById("answers");
const timerElement = document.getElementById("time");
function loadQuestion() {
  const q = datapick[currentQuestionIndex];
  questionElement.textContent = q.question;
  answersElement.innerHTML = "";
  q.answers.forEach((ans, index) => {
    const div = document.createElement("div");
    div.innerHTML = `<button class="btn" onclick="checkAnswer(${index})">${ans}</button><br>`;
    div.className = "n";
    answersElement.appendChild(div);
  });
  // Jalankan shuffle setelah semua button sudah ditambahkan
  setTimeout(() => {
    shuffleButtons();
  }, 0);
}

function shuffleButtons() {
  let parent = document.getElementById("answers");
  let divs = Array.from(parent.children); // Ambil semua elemen <div> di dalamnya

  divs.sort(() => Math.random() - 0.5); // Acak urutan elemen

  divs.forEach((div) => {
    div.classList.remove("n");
    parent.appendChild(div);
  });
}

function checkAnswer(index) {
  console.log(index, datapick[currentQuestionIndex].correct);
  if (index === datapick[currentQuestionIndex].correct) {
    let nr;
    if (jr) nr = jr;
    if (myroom) nr = myroom;
    Object.entries(roomfb).forEach(([key, value]) => {
      if (value.name === nr) {
        let data = value;
        data.game.correct++;
        updateRoom(nr, data);
      }
    });
  }
  nextQuestion();
}

function nextQuestion() {
  let nr;
  if (jr) nr = jr;
  if (myroom) nr = myroom;
  if (currentQuestionIndex < datapick.length - 1) {
    Object.entries(roomfb).forEach(([key, value]) => {
      if (value.name === nr) {
        let data = value;
        data.game.numdt++;
        updateRoom(nr, data);
      }
    });
  } else {
    Object.entries(roomfb).forEach(([key, value]) => {
      if (value.name === nr) {
        let data = value;
        data.game.done = true;
        data.game.duration = dtk;
        updateRoom(nr, data);
      }
    });
  }
}

let kode = []; // Array untuk menyimpan kode yang sudah dieksekusi

function runFunctionIfNew(fnString, kode2) {
  if (!kode.includes(kode2)) {
    // Cek apakah kode sudah ada
    kode.push(kode2); // Simpan kode ke array
    try {
      let fnName = fnString.replace(/\(\)/, ""); // Ambil nama function tanpa ()
      if (typeof window[fnName] === "function") {
        window[fnName](); // Jalankan function jika ada
      } else {
        // console.error("Function tidak ditemukan:", fnName);
      }
    } catch (error) {
      // console.error("Error:", error);
    }
  } else {
    // console.log("Kode sudah dieksekusi sebelumnya:", kode2);
  }
}

function awake() {
  generateRandomID();
  generateDataPick(10);
}
awake();

let dtk = 0;
let startdtk = false;
setInterval(() => {
  if (startdtk) {
    dtk++;
  }
}, 1000);

let timeoutId;

window.addEventListener("beforeunload", function () {
  let nr;
  if (jr) nr = jr;
  if (myroom) nr = myroom;

  if (nr) {
    const url =
      "https://mind-twister-duo-default-rtdb.firebaseio.com/rooms/" +
      nr +
      ".json";

    fetch(url, {
      method: "DELETE",
      keepalive: true, // Pastikan request tetap berjalan meskipun halaman ditutup
    });
  }
});

setInterval(() => {
  if (jr || myroom) {
    let nr;
    if (jr) nr = jr;
    if (myroom) nr = myroom;
    Object.entries(roomfb).forEach(([key, value]) => {
      if (nr === value.name) {
        if (myroom) {
          if (myroom === value.name) {
            const stroom = document.getElementById("stroom");
            if (value.player.length > 1) {
              stroom.classList.remove("n");
            } else {
              stroom.classList.add("n");
            }
          }
        }
        if (value.play) {
          const game = document.getElementById("game");
          const host = document.getElementById("host");
          const client = document.getElementById("client");
          const loading = document.getElementById("loading");

          const answers = document.getElementById("answers");
          const question = document.getElementById("question");
          host.classList.add("n");
          client.classList.add("n");
          loading.classList.add("n");
          game.classList.remove("n");
          runFunctionIfNew("loadQuestion()", "lq");
          if (myroom) answers.classList.remove("n");
          if (jr) question.classList.remove("n");

          startdtk = true;
        }
        if (currentQuestionIndex !== value.game.numdt) {
          currentQuestionIndex = value.game.numdt;
          loadQuestion();
        }
        if (value.game.done) {
          const dones = document.getElementById("dones");
          const game = document.getElementById("game");
          const host = document.getElementById("host");
          const client = document.getElementById("client");
          const loading = document.getElementById("loading");
          host.classList.add("n");
          client.classList.add("n");
          loading.classList.add("n");
          game.classList.add("n");
          dones.classList.remove("n");
          const nroomd = document.getElementById("nroomd");
          const correctdroom = document.getElementById("correct-droom");
          const durationdroom = document.getElementById("duration-droom");
          const playerdroom = document.getElementById("player-droom");
          nroomd.innerHTML = value.name;
          correctdroom.innerHTML = "Correct: " + value.game.correct;
          durationdroom.innerHTML =
            "Duration: " + value.game.duration + " seconds";
          playerdroom.innerHTML = "Player: " + value.player;
        }
      }
    });
    cdt(nr);
  }
  getRoomData();
}, 500);
