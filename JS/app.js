// Récupérer l'élément canvas et son contexte 2D
const world = document.querySelector('#gameBoard');
const c = world.getContext('2d');

// Définir la taille du canvas
world.width = world.clientWidth;
world.height = world.clientHeight;

// Compteur de frames pour gérer certaines actions temporisées
let frames = 0;

// Niveau de difficulté initial
let difficultyLevel = 1;

// Score initial
let score = 0;

// États des touches du clavier
const keys = {
    ArrowLeft: { pressed: false },
    ArrowRight: { pressed: false },
    fired: { pressed: false }
};

// Ajout des variables pour gérer le délai de tir
let lastShotTime = 0;
const shotCooldown = 10; // Délai en nombre de frames

// Variable pour stocker l'ID de la boucle d'animation
let animationId = null;
let isGamePaused = false;

// Classe Player : Gère le joueur, ses mouvements et ses tirs
class Player {
    constructor() {
        this.velocity = { x: 0, y: 0 };
        this.loadImage('./avion.png');
    }

    loadImage(src) {
        const image = new Image();
        image.src = src;
        image.onload = () => {
            this.image = image;
            this.width = 48;
            this.height = 48;
            this.position = {
                x: world.width / 2 - this.width / 2,
                y: world.height - this.height - 10
            };
        };
    }

    draw() {
        if (this.image) {
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
    }

    shoot() {
        const currentTime = frames;
        if (currentTime - lastShotTime > shotCooldown) {
            missiles.push(new Missile({
                position: {
                    x: this.position.x + this.width / 2,
                    y: this.position.y
                }
            }));
            lastShotTime = currentTime;
        }
    }

    update() {
        if (this.image) {
            if (keys.ArrowLeft.pressed && this.position.x >= 0) {
                this.velocity.x = -5;
            } else if (keys.ArrowRight.pressed && this.position.x <= world.width - this.width) {
                this.velocity.x = 5;
            } else {
                this.velocity.x = 0;
            }
            this.position.x += this.velocity.x;
            this.draw();
        }
    }
}

// Classe Alien : Gère les ennemis, leurs mouvements et leurs tirs
class Alien {
    constructor({ position }) {
        this.velocity = { x: 0, y: 0 };
        this.loadImage('./alien.png', position);
    }

    loadImage(src, position) {
        const image = new Image();
        image.src = src;
        image.onload = () => {
            this.image = image;
            this.width = 32;
            this.height = 32;
            this.position = position;
        };
    }

    draw() {
        if (this.image) {
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
    }

    update({ velocity }) {
        if (this.image) {
            this.position.x += velocity.x;
            this.position.y += velocity.y;
            if (this.position.y + this.height >= world.height) {
                console.log('You loose');
            }
        }
        this.draw();
    }

    shoot(alienMissiles) {
        if (this.position) {
            alienMissiles.push(new alienMissile({
                position: { x: this.position.x, y: this.position.y },
                velocity: { x: 0, y: 3 }
            }));
        }
    }
}

// Classe Missile : Gère les missiles tirés par le joueur
class Missile {
    constructor({ position }) {
        this.position = position;
        this.velocity = { x: 0, y: -5 };
        this.width = 3;
        this.height = 10;
    }

    draw() {
        c.save();
        c.fillStyle = 'red';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
        c.fill();
        c.restore();
    }

    update() {
        this.position.y += this.velocity.y;
        this.draw();
    }
}

// Classe Grid : Gère la grille des ennemis
class Grid {
    constructor() {
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 1 * difficultyLevel, y: 0 };
        this.invaders = [];
        this.createInvaders();
    }

    createInvaders() {
        let rows = Math.floor((world.height / 34) * (1 / 5));
        const columns = Math.floor((world.width / 34) * (2 / 5));
        this.height = rows * 34;
        this.width = columns * 34;
        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                this.invaders.push(new Alien({
                    position: {
                        x: x * 34,
                        y: y * 34
                    }
                }));
            }
        }
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.y = 0;
        if (this.position.x + this.width >= world.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x;
            this.velocity.y = 34;
        }
    }
}

// Classe Particule : Gère les particules pour les effets visuels
class Particule {
    constructor({ position, velocity, radius, color }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
        this.color = color;
        this.opacity = 1;
    }

    draw() {
        c.save();
        c.globalAlpha = this.opacity;
        c.beginPath();
        c.fillStyle = this.color;
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fill();
        c.closePath();
        c.restore();
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        if (this.opacity > 0) {
            this.opacity -= 0.01;
        }
        this.draw();
    }
}

// Classe alienMissile : Gère les missiles tirés par les aliens
class alienMissile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.width = 3;
        this.height = 10;
    }

    draw() {
        c.save();
        c.fillStyle = 'yellow';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
        c.fill();
        c.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

// Variables globales
let missiles = [];
let alienMissiles = [];
let grids = [];
let player;
let particules = [];
let lifes;

// Récupérer les éléments du DOM pour la mise à jour du score, des vies et du niveau
const levelDisplay = document.getElementById('level');
const livesDisplay = document.getElementById('lives');
const scoreDisplay = document.getElementById('score');

// Fonction pour initialiser le jeu
const init = () => {
    missiles = [];
    alienMissiles = [];
    grids = [new Grid()];
    player = new Player();
    particules = [];
    lifes = 3;
    score = 0;
    difficultyLevel = 1;
    keys.ArrowLeft.pressed = false;
    keys.ArrowRight.pressed = false;
    keys.fired.pressed = false;
    updateDisplays();
};

// Fonction pour mettre à jour l'affichage des vies, du niveau et du score
const updateDisplays = () => {
    levelDisplay.textContent = difficultyLevel.toString();
    livesDisplay.textContent = lifes.toString();
    scoreDisplay.textContent = score.toString();
};

// Fonction pour gérer la perte de vie du joueur
const lostLife = () => {
    lifes--;
    updateDisplays();
    if (lifes <= 0) {
        alert('Perdu');
        difficultyLevel = 1;
        init();
    }
};

// Fonction pour gérer l'augmentation de score lorsqu'un alien est détruit
const increaseScore = () => {
    score += 10;
    updateDisplays();
};

// Fonction togglePause pour gérer pause/reprise
const togglePause = () => {
    isGamePaused = !isGamePaused;
    if (isGamePaused) {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        // Reset des touches pour éviter comportement non voulu
        keys.ArrowLeft.pressed = false;
        keys.ArrowRight.pressed = false;
        keys.fired.pressed = false;
    } else {
        if (!animationId) {
            animationLoop();
        }
    }
};

// Boucle principale du jeu
const animationLoop = () => {
    if (isGamePaused) return;

    c.clearRect(0, 0, world.width, world.height);

    player.update();

    // Mettre à jour et dessiner les missiles du joueur
    missiles.forEach((missile, index) => {
        if (missile.position.y + missile.height <= 0) {
            missiles.splice(index, 1);
        } else {
            missile.update();
        }
    });

    // Mettre à jour et dessiner les aliens et gérer les collisions
    grids.forEach((grid, indexGrid) => {
        grid.update();
        // Probabilité de tir basée sur la difficulté
        const fireProbability = 0.01 * difficultyLevel;
        if (grid.invaders.length > 0 && Math.random() < fireProbability) {
            const randomAlienIndex = Math.floor(Math.random() * grid.invaders.length);
            grid.invaders[randomAlienIndex].shoot(alienMissiles);
        }
        grid.invaders.forEach((invader, indexI) => {
            invader.update({ velocity: grid.velocity });
            missiles.forEach((missile, indexM) => {
                if (
                    missile.position.y <= invader.position.y + invader.height &&
                    missile.position.y >= invader.position.y &&
                    missile.position.x + missile.width >= invader.position.x &&
                    missile.position.x - missile.width <= invader.position.x + invader.width
                ) {
                    // Ajout des particules pour l'effet d'explosion
                    for (let i = 0; i < 12; i++) {
                        particules.push(new Particule({
                            position: {
                                x: invader.position.x + invader.width / 2,
                                y: invader.position.y + invader.height / 2
                            },
                            velocity: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
                            radius: Math.random() * 5 + 1,
                            color: 'red'
                        }));
                    }
                    setTimeout(() => {
                        grid.invaders.splice(indexI, 1);
                        missiles.splice(indexM, 1);
                        if (grid.invaders.length === 0 && grids.length === 1) {
                            difficultyLevel += 0.5;
                            grids.splice(indexGrid, 1);
                            grids.push(new Grid());
                            increaseScore();
                        }
                    }, 0);
                }
            });
        });
    });

    // Mettre à jour et dessiner les missiles aliens
    alienMissiles.forEach((alienMissile, index) => {
        if (alienMissile.position.y + alienMissile.height >= world.height) {
            alienMissiles.splice(index, 1);
        } else {
            alienMissile.update();
        }
        if (
            alienMissile.position.y + alienMissile.height >= player.position.y &&
            alienMissile.position.y <= player.position.y + player.height &&
            alienMissile.position.x >= player.position.x &&
            alienMissile.position.x + alienMissile.width <= player.position.x + player.width
        ) {
            alienMissiles.splice(index, 1);
            for (let i = 0; i < 22; i++) {
                particules.push(new Particule({
                    position: {
                        x: player.position.x + player.width / 2,
                        y: player.position.y + player.height / 2
                    },
                    velocity: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
                    radius: Math.random() * 5,
                    color: 'white'
                }));
            }
            lostLife();
        }
    });

    // Mettre à jour et dessiner les particules
    particules.forEach((particule, index) => {
        if (particule.opacity <= 0) {
            particules.splice(index, 1);
        } else {
            particule.update();
        }
    });

    frames++;
    animationId = requestAnimationFrame(animationLoop);
};

// Gestion des événements clavier
window.addEventListener('keydown', (event) => {
    if (isGamePaused) return;

    switch (event.key) {
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            break;
        case ' ':
            event.preventDefault(); // Empêche le scroll de la page sur espace
            player.shoot();
            break;
        case 'p': // Raccourci clavier pour pause/play
            togglePause();
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
    }
});

// Bouton démarrer
document.getElementById('startButton').addEventListener('click', () => {
    init();
    isGamePaused = false;
    if (!animationId) {
        animationLoop();
    }
});

// Bouton pause
document.getElementById('pauseButton').addEventListener('click', () => {
    togglePause();
});

// Initialisation du jeu au chargement
init();
