const SUPABASE_URL = "https://wmpzzufmkfjxjxqwcodv.supabase.co";
const SUPABASE_KEY = "sb_publishable_iyYaRHNo37vupFJxbOi9TQ_JKdzCmNc";

const sb = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const canvas = document.getElementById("canvas");
const drawArea = canvas.getContext("2d");
const clearBtn = document.getElementById("clearBtn");
const form = document.getElementById("form");

const catBox = document.getElementById("catBox"); 
const openBtn = document.getElementById("openBtn"); 
const panel = document.getElementById("panel"); 

// Panel switch 
openBtn.addEventListener("click", () => {
  panel.classList.toggle("hidden");
});


// Set the draw line
let drawing = false;
drawArea.strokeStyle = '#3583ff';
drawArea.lineWidth = 6;
drawArea.lineCap = "butt";
drawArea.lineJoin = "miter";

// Draw while the mouse moves
canvas.addEventListener("pointerdown", (e) => {
  drawing = true;
  drawArea.beginPath();
  drawArea.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener("pointermove", (e) => {
  if (!drawing) return;
  drawArea.lineTo(e.offsetX, e.offsetY);
  drawArea.stroke();
});

canvas.addEventListener("pointerup", () => {
  drawing = false;
});

canvas.addEventListener("pointerleave", () => {
  drawing = false;
});


//Clear the entire canvas
clearBtn.addEventListener("click", () => {
  drawArea.clearRect(0, 0, canvas.width, canvas.height);
});


// Cut EmptySpace in canvas
function cutEmptySpace(oldCanvas) { 
  const oldDrawArea = oldCanvas.getContext("2d"); 
  const width = oldCanvas.width;
  const height = oldCanvas.height;
  const imageData = oldDrawArea.getImageData(0, 0, width, height);
  const data = imageData.data;

  let top = height;
  let left = width;
  let right = 0;
  let bottom = 0;
  let hasDrawing = false;

  // Check every pixel on the canvas
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3];

      if (alpha > 0) {
        hasDrawing = true;
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }

  if (!hasDrawing) return null;

  const padding = 6;
  left = Math.max(0, left - padding);
  top = Math.max(0, top - padding);
  right = Math.min(width - 1, right + padding);
  bottom = Math.min(height - 1, bottom + padding);

  const croppedWidth = right - left + 1;
  const croppedHeight = bottom - top + 1;

  const newCanvas = document.createElement("canvas");
  newCanvas.width = croppedWidth;
  newCanvas.height = croppedHeight;

  const newDrawArea = newCanvas.getContext("2d");
  newDrawArea.drawImage(
    oldCanvas,
    left,
    top,
    croppedWidth,
    croppedHeight,
    0,
    0,
    croppedWidth,
    croppedHeight
  );

  return newCanvas;
}

function canvasToPngFile(sourceCanvas) {
  return new Promise((resolve, reject) => {
    sourceCanvas.toBlob((result) => {
      if (!result) {
        reject(new Error("Could not create image file."));
        return;
      }
      resolve(result);
    }, "image/png");
  });
}



// Put all cats in right place
function putCatInPlace(catCard) {
  const scene = document.querySelector(".park-scene");
  const sceneRect = scene.getBoundingClientRect();

  catCard.style.visibility = "hidden";
  catCard.style.left = "0px";
  catCard.style.top = "0px";
  catCard.style.transform = "none";
  catBox.appendChild(catCard);

  const cards = [...document.querySelectorAll(".cat-card")];
  const index = cards.length - 1;
// Layout settings
  const startX = 45;
  const startY = 150;
  const gapX = 30;
  const gapY = 40;
  const cardWidth = 120;
  const cardHeight = 180;

  const usableWidth = sceneRect.width - 20;
  const columns = Math.max(1, Math.floor(usableWidth / (cardWidth + gapX)));

  const col = index % columns;
  const row = Math.floor(index / columns);

  const offsetX = row % 2 === 0 ? 0 : 30;

  const x = startX + col * (cardWidth + gapX) + offsetX;
  const y = startY + row * (cardHeight + gapY);

  catCard.style.left = `${x}px`;
  catCard.style.top = `${y}px`;
  catCard.style.visibility = "visible";
  const neededHeight = y + cardHeight + 80;
  scene.style.minHeight = `${Math.max(window.innerHeight, neededHeight)}px`;
}

function getCatImageUrl(catPath) {
  const { data } = sb.storage
    .from("cat-images")
    .getPublicUrl(catPath);

  return data.publicUrl;
}
function makeCatCard(name, message, imageUrl) {
  const catCard = document.createElement("div");
  catCard.className = "cat-card";

  catCard.innerHTML = `
    <div class="cat-wrap">
      <div class="cat-bubble">
        <span class="cat-text"></span>
        <div class="cat-line"></div>
      </div>
      <img src="" alt="cat drawing" class="cat-image">
    </div>
    <p class="cat-name"></p>
  `;

  catCard.querySelector(".cat-text").textContent = message;
  catCard.querySelector(".cat-image").src = imageUrl;
  catCard.querySelector(".cat-name").textContent = name;

  return catCard;
}

async function loadCats() {
  const { data, error } = await sb
    .from("cats_messages")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("load failed:", error);
    return;
  }

  catBox.innerHTML = "";

  data.forEach((cat) => {
    const imageUrl = getCatImageUrl(cat.cat_path);
    const catCard = makeCatCard(cat.name, cat.message, imageUrl);
    putCatInPlace(catCard);
  });
}
// Submit the cat and clear form
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!name || !message) {
    alert("Please write your name and message.");
    return;
  }

  const newCanvas = cutEmptySpace(canvas);

  if (!newCanvas) {
    alert("Please draw a cat first.");
    return;
  }

  try {
    const catFile = await canvasToPngFile(newCanvas);

    const filePath = `cats/${Date.now()}-${crypto.randomUUID()}.png`;

    const { error: uploadError } = await sb.storage
      .from("cat-images")
      .upload(filePath, catFile, {
        contentType: "image/png",
        upsert: false
      });

    if (uploadError) {
      console.error("upload failed:", uploadError);
      alert(uploadError.message || JSON.stringify(uploadError));
      return;
    }

    const { error: insertError } = await sb
      .from("cats_messages")
      .insert([
        {
          name: name,
          message: message,
          cat_path: filePath
        }
      ]);

    if (insertError) {
      console.error("save failed:", insertError);
      alert(insertError.message || JSON.stringify(insertError));
      return;
    }

    const imageUrl = getCatImageUrl(filePath);
    const catCard = makeCatCard(name, message, imageUrl);
    putCatInPlace(catCard);

    form.reset();
    drawArea.clearRect(0, 0, canvas.width, canvas.height);
    panel.classList.add("hidden");
  } catch (error) {
    console.error("unexpected error:", error);
    alert("Something went wrong...");
  }
});

loadCats();
