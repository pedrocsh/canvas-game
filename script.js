const canvas = document.querySelector("canvas")
const context = canvas.getContext("2d")
const scoreElement = document.getElementById("score__value")
const start = document.getElementById("start")
const modal = document.getElementById("modal")
const finalScore = document.getElementById("final__score")

canvas.width = innerWidth
canvas.height = innerHeight

class Player {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
  }

  draw() {
    context.beginPath()
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    context.fillStyle = this.color
    context.fill()
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }

  draw() {
    context.beginPath()
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    context.fillStyle = this.color
    context.fill()
  }

  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }

  draw() {
    context.beginPath()
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    context.fillStyle = this.color
    context.fill()
  }

  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

const friction = 0.99

class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha = 1
  }

  draw() {
    context.save()
    context.globalAlpha = this.alpha
    context.beginPath()
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    context.fillStyle = this.color
    context.fill()
    context.restore()
  }

  update() {
    this.draw()
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    this.alpha -= 0.01
  }
}

const x = canvas.width / 2
const y = canvas.height / 2
let player = new Player(x, y, 10, 'white')
let projectiles = []
let enemies = []
let particles = []

function init() {
  player = new Player(x, y, 10, 'white')
  projectiles = []
  enemies = []
  particles = []
  score = 0
  scoreElement.innerText = score
  finalScore.innerText = score
}

function spawnEnemies() {
  setInterval(() => {
    const radius = Math.random() * (30 - 8) + 8
    let x
    let y

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
      y = Math.random() * canvas.height
    } else {
      x = Math.random() * canvas.width
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    }

    const enemy = new Enemy(x, y, radius, color, velocity)
    enemies.push(enemy)
  }, 1000)
}

let animationId
let score = 0

function animate() {
  animationId = requestAnimationFrame(animate)
  context.fillStyle = 'rgba(0, 0, 0, 0.1)'
  context.fillRect(0, 0, canvas.width, canvas.height)
  player.draw()
  particles.forEach((particle, particleIndex) => {

    if (particle.alpha <= 0) {
      particles.splice(particleIndex, 1)
    } else {
      particle.update()
    }
  })
  projectiles.forEach((projectile, projectileIndex) => {
    projectile.update()

    if (projectile.x + projectile.radius < 0
      || projectiles.x - projectile.radius > canvas.width
      || projectile.y + projectile.radius < 0
      || projectile.y - projectile.radius > canvas.height) {
      setTimeout(() => {
        projectiles.splice(projectileIndex, 1)
      }, 0)
    }
  })

  enemies.forEach((enemy, enemyIndex) => {
    enemy.update()

    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y)

    if (distance - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId)
      modal.style.display = 'flex'
      finalScore.innerText = score
    }

    projectiles.forEach((projectile, projectileIndex) => {
      const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

      if (distance - enemy.radius - projectile.radius < 1) {
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
            x: (Math.random() - 0.5) * (Math.random() * 8),
            y: (Math.random() - 0.5) * (Math.random() * 8),
          }))
        }

        if (enemy.radius - 10 > 5) {
          score += 100
          scoreElement.innerText = score
          gsap.to(enemy, {
            radius: enemy.radius - 10
          })

          setTimeout(() => {
            projectiles.splice(projectileIndex, 1)
          }, 0)
        } else {
          score += 250
          scoreElement.innerText = score
          setTimeout(() => {
            enemies.splice(enemyIndex, 1)
            projectiles.splice(projectileIndex, 1)
          }, 0)
        }
      }
    })
  })
}

addEventListener('click', event => {
  const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
  const velocity = {
    x: Math.cos(angle) * 8,
    y: Math.sin(angle) * 8
  }

  const projectile = new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity)

  projectiles.push(projectile)
})

start.addEventListener('click', () => {
  init()
  animate()
  spawnEnemies()
  modal.style.display = 'none'
})
