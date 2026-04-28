// Get elements
const playBtn = document.getElementById('playBtn');
const instructionsBtn = document.getElementById('instructionsBtn');
const controlsBtn = document.getElementById('controlsBtn');
const backgroundBtn = document.getElementById('backgroundBtn');

const instructionsModal = document.getElementById('instructionsModal');
const controlsModal = document.getElementById('controlsModal');
const closeInstructions = document.getElementById('closeInstructions');
const closeControls = document.getElementById('closeControls');

// Play button: redirect to game
playBtn.addEventListener('click', () => {
    window.location.href = 'studs/studs.html';
});

// Instructions modal
instructionsBtn.addEventListener('click', () => {
    instructionsModal.style.display = 'block';
});

closeInstructions.addEventListener('click', () => {
    instructionsModal.style.display = 'none';
});

// Controls modal
controlsBtn.addEventListener('click', () => {
    controlsModal.style.display = 'block';
});

closeControls.addEventListener('click', () => {
    controlsModal.style.display = 'none';
});

// Background toggle
backgroundBtn.addEventListener('click', () => {
    document.body.classList.toggle('animated');
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === instructionsModal) {
        instructionsModal.style.display = 'none';
    }
    if (event.target === controlsModal) {
        controlsModal.style.display = 'none';
    }
});