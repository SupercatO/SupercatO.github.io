// Img Slider
const slides = document.querySelectorAll(".slides img");
let slideIndex = 0;
let intervalId = null;

document.addEventListener("DOMContentLoaded", () => {
    initializeSlider();
    runDialogue();
    initRoomSection();
    initSkillConsole();
});

function initializeSlider(){
    if(slides.length > 0){
        slides[slideIndex].classList.add("displaySlide");
        intervalId = setInterval(nextSlide, 5000);
    }
}

function showSlide(index){
    if(index >= slides.length){
        slideIndex = 0;
    }
    else if(index < 0){
        slideIndex = slides.length -1;
    }

    slides.forEach(slide =>{
        slide.classList.remove("displaySlide");
    });
    slides[slideIndex].classList.add("displaySlide");
}

function prevSlide(){
    clearInterval(intervalId);
    slideIndex--;
    showSlide(slideIndex);
}

function nextSlide(){
    slideIndex++;
    showSlide(slideIndex);
}



// Typewriter▮
function typeEffect(element, text, speed, callback) {
    let i = 0;
    element.textContent = "";
    function typing() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typing, speed);
        } else if (callback) {
            callback();
        }
    }
    typing();
}



// ◑ω◑ Eyes Follow Mouse Cursor！
const pupils = document.querySelectorAll(".pupil");

document.addEventListener("mousemove",(e)=>{
    pupils.forEach((pupil) =>{
        const eye = pupil.parentElement;
        var rect = eye.getBoundingClientRect();

        // Calculate the center point of the eye
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;  

        var x = (e.pageX - centerX)/99;
        var y = (e.pageY - centerY)/100;

        // reverse the mirrored right eye
        if (eye.classList.contains("eyeR")) {
            x = -x; 
        }
        pupil.style.transform = "translate3d("+ x + "px," + y +"px,0px)";
    });
});


// Make Digital Clock more real！
let hrs = document.getElementById("hrs");
let min = document.getElementById("min");
let sec = document.getElementById("sec");

setInterval(()=>{
    let currentTime = new Date();
    
    hrs.innerHTML = (currentTime.getHours()<10?"0":"") + currentTime.getHours();
    min.innerHTML = (currentTime.getMinutes()<10?"0":"") + currentTime.getMinutes();
    sec.innerHTML = (currentTime.getSeconds()<10?"0":"") + currentTime.getSeconds();
},1000)



// Talking Bubble show up
const bubble = document.querySelector(".talk");
const textElement = document.getElementById("text-content");

const textArray = [
    "Welcome to my world",
    "Hi, I'm supercat!:D",
    "This desk reacts, by the way.",
    "Fun fact:I don't like fish.",
    "But I do like taiyaki.",
    "Do you… have homework?",
    "Alright… that's enough."
];

let currentTextIndex = 0;
const typingSpeed = 50;
const deletingSpeed = 30;
const holdTime = 1300;
let isRunning = false;

// Typewriter Animation
function runDialogue(){
    if (isRunning) return;
    isRunning = true;
    
    bubble.classList.add("show");
    const text = textArray[currentTextIndex];

    typeEffect(textElement, text, typingSpeed, () => {
        setTimeout(deleteText, holdTime);
    });
}

function deleteText() {
    function deleting() {
        if (textElement.textContent.length > 0){
            textElement.textContent = textElement.textContent.slice(0, -1);
            setTimeout(deleting, deletingSpeed);
        }
        else{
            bubble.classList.remove("show");
            currentTextIndex = (currentTextIndex+1)% textArray.length;
            isRunning = false;
        }
    }
    deleting();
}

function talk() {
    runDialogue();
}



// Room section
function initRoomSection() {
    const stickers = document.querySelectorAll('.sticker');
    const positions = [
        {x:16, y:5},
        {x:5, y:28},
        {x:23, y:37},
        {x:37, y:15} 
    ];

    stickers.forEach((sticker, i) => {
        const pos = positions[i];
        sticker.style.left = pos.x + "%";
        sticker.style.top = pos.y + "%";

        const r = Math.random() * 10 - 5;
        sticker.style.setProperty('--r', r + "deg");

        sticker.style.transitionDelay = `${i * 0.2}s`;

        const normal = sticker.querySelector('.normal');
        const text = normal.textContent;
        normal.textContent = "";

        setTimeout(() => {
            typeEffect(normal, text, 15);
        }, i * 400); 
    });
}




//Random Deco Symbols
const decoSymbols = [".", "☆", "*", "o", "★", "｡","☆", "`", "ö", "+", "※", "✧", "⊹", "*"];

function createDecos() {
    const wall = document.querySelector('.sticker-wall');
    if (!wall) return;

    const oldDecos = wall.querySelectorAll('.deco-item');
    oldDecos.forEach(item => item.remove());

    const decoCount = 55;

    for (let i = 0; i < decoCount; i++) {
        const deco = document.createElement('div');
        deco.className = 'deco-item';
        
        const symbol = decoSymbols[Math.floor(Math.random() * decoSymbols.length)];
        deco.innerText = symbol;

        const x = Math.random() * 50 + 1; 
        const y = Math.random() * 60 + 1; 
        const r = Math.random() * 40 - 20; 

        Object.assign(deco.style, {
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            transform: `rotate(${r}deg) scale(0)`,
            opacity: '0',
            fontSize: `${3 + Math.random() * 15}px`, 
            color: '#c3c3c3', 
            pointerEvents: 'none', 
            zIndex: '4',
            fontFamily: "'PressStart2P', monospace",
            whiteSpace: 'nowrap',
            transition: 'transform 0.5s cubic-bezier(.34,1.56,.64,1), opacity 0.5s'
        });

        wall.appendChild(deco);

        setTimeout(() => {
            deco.style.transform = `rotate(${r}deg) scale(1)`;
            deco.style.opacity = '0.5';
        }, 100 + (i * 25));
    }
}



//Damping Scroll
const observerOptions = {
    root: null,
    threshold: 0.3
};

const wallObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            createDecos();
        } else {
            const wall = document.querySelector('.sticker-wall');
            if (wall) {
                const oldDecos = wall.querySelectorAll('.deco-item');
                oldDecos.forEach(item => item.remove());
            }
        }
    });
}, observerOptions);

const targetWall = document.querySelector('.sticker-wall');
if (targetWall) {
    wallObserver.observe(targetWall);
}



//Scroll Cat
let isScrolling = false;

window.addEventListener('wheel', (e) => {
    e.preventDefault();

    if (isScrolling) return;

    const direction = e.deltaY > 0 ? 1 : -1;
    const vh = window.innerHeight;
    const currentScroll = window.scrollY;

    const rawTarget = Math.round(currentScroll / vh + direction) * vh;
    const maxScroll = document.documentElement.scrollHeight - vh;
    const targetScroll = Math.max(0, Math.min(rawTarget, maxScroll));

    if (targetScroll === currentScroll) return;

    isScrolling = true;

    window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
    });

    setTimeout(() => {
        isScrolling = false;
    }, 900);
}, { passive: false });


document.addEventListener('mousemove', (e) => {
    const zone = document.querySelector('.nav-trigger-zone');
    const logo = document.querySelector('.logo-glass-element');
    
    if (!zone || !logo) return;

    const zoneRect = zone.getBoundingClientRect();
    zone.style.setProperty('--mouse-x', `${e.clientX - zoneRect.left}px`);
    zone.style.setProperty('--mouse-y', `${e.clientY - zoneRect.top}px`);

    const logoRect = logo.getBoundingClientRect();
    logo.style.setProperty('--mouse-x', `${e.clientX - logoRect.left}px`);
    logo.style.setProperty('--mouse-y', `${e.clientY - logoRect.top}px`);
});



window.addEventListener('scroll', () => {
const cat = document.getElementById('slidingCat');
    if (!cat) return;

    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    
    let progress = scrollY / vh;

    if (progress >= 1) {
        progress = 1; 
    } else if (progress < 0) {
        progress = 0;
    }

    const startScale = 1;
    const endScale = 0.5;
    const currentScale = startScale - (progress * (startScale - endScale));

    const startY = 105; 
    const endY = -10; 
    const currentY = startY + (progress * (endY - startY));

    cat.style.setProperty('--cat-scale', currentScale);
    cat.style.setProperty('--cat-y', currentY + '%');

    cat.src = progress < 0.1 ? "Img/cat_frame1.png" : "Img/cat_frame4.png";
});



//typing skills
function initSkillConsole() {
    const wall = document.querySelector('.weave-wall');
    const skillContainer = document.querySelector('.skill-container');
    const codeEl = document.getElementById('skillCode');
    
    const skillText = `
          /╲_/╲
         ( •ω• ) 
      xxxxxxxxxxxxxx
   *===================*
 /|+\\/\\/\\/\\/\\/\\/\\/\\/\/\\+|
( |+ < I'M_LEARNING > +|\\
 \\|+ ---------------- +|/
( |+  HTML  CSS  JS   +| )
 /|+ PYTHON JAVA C++  +|/
( |+ ---------------- +| )
 \\|+<> <> <> <> <> <> +|/
  |+\\/\\/\\/\\/\\/\\/\\/\\/\\/+|
  *====================*
  :  :    :   :     :  :
 v   v    v   v     v   v
`;

    let hasTyped = false;

    function typeSkills(text, element) {
        element.innerHTML = "";
        let i = 0;
        
        function step() {
            if (i < text.length) {
                const char = text.charAt(i);
                if (char === "\n") {
                    element.innerHTML += "<br>";
                } else if (char === " ") {
                    element.innerHTML += "&nbsp;";
                } else {
                    const span = document.createElement('span');
                    span.className = 'char';
                    span.innerText = char;
                    span.dataset.original = char;
                    element.appendChild(span);
                }
                i++;
                setTimeout(step, 10);
            } else {
                enableDotInteraction();
            }
        }
        step();
    }

    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasTyped) {
                hasTyped = true;
                wall.classList.add('active');
                
                setTimeout(() => {
                    skillContainer.style.opacity = "1";
                    typeSkills(skillText, codeEl);
                }, 2500);
            }
        });
    }, { threshold: 0.3 });

    if (wall) skillObserver.observe(wall);

    function enableDotInteraction() {
        const dotChars = [".", "•", "*"];
        const radius = 60;
        const allChars = document.querySelectorAll('.char');

        window.addEventListener('pointermove', (e) => {
            allChars.forEach(span => {
                const rect = span.getBoundingClientRect();
                const charX = rect.left + rect.width / 2;
                const charY = rect.top + rect.height / 2;
                const dist = Math.hypot(e.clientX - charX, e.clientY - charY);

                if (dist < radius) {
                    if (span.innerText !== " " && span.innerText !== "") {
                        span.innerText = dotChars[Math.floor(Math.random() * dotChars.length)];
                        span.classList.add('is-dot');
                    }
                } else {
                    span.innerText = span.dataset.original;
                    span.classList.remove('is-dot');
                }
            });
        });
    }
}