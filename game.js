const canvas = document.getElementById("canvas")
const c = canvas.getContext("2d")

let secondsPassed
let oldTimeStamp
let timer = 0

const tile_height = 40

a_pressed = false
d_pressed = false
w_pressed = false
space_pressed = false
right_mouse_down = false
mouse_x = 0
mouse_y = 0

const g = 1

class Player {
    constructor(position) {
        this.pos = position
        this.vel = {x: 0, y: 0}
        this.width = 20
        this.height = 40
        this.isFalling = true
        this.isJumping = false
    }

    draw() {
        c.fillStyle = "black"
        c.fillRect(this.pos.x, this.pos.y, this.width, this.height)
    }

    update() {
        //mozgas
        this.isFalling = isFalling(this, tile_list)

        if (!this.isFalling && !this.isJumping){
            this.vel.y = 0
        }else if (!this.isJumping){
            this.vel.y += g
        }

        if (canMove(this, tile_list)){
            this.pos.x += this.vel.x
        }else
            this.vel.x = 0

        if (this.vel.y>0)
            this.pos.y += this.vel.y
        else if (canMove(this, tile_list))
            this.pos.y += this.vel.y
            
        this.isJumping = false

        this.draw()
    }

    jump () {
        if (!this.isFalling){
            this.isJumping = true
            this.vel.y = -20
        }
    }

}

class Bullet {
    constructor(player, target) {
        this.pos = {x: player.pos.x+player.width/2, y: player.pos.y+player.height/4}
        this.dir = this.direction(player.pos.x, player.pos.y, target.x, target.y)
        this.vel = {x: this.dir.x*20, y: this.dir.y*20}
        this.r = 5
    }

    direction(x1, y1, x2, y2){
        this.v = {x: x2-x1, y: y2-y1}
        this.v_len = Math.sqrt(this.v.x**2 + this.v.y**2)
        return {x: this.v.x/this.v_len, y: this.v.y/this.v_len}
    }

    draw() {
        c.fillStyle = "black"
        c.beginPath();
        c.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
        c.stroke();
        c.fill()
    }

    update() {
        this.pos.x += this.vel.x
        this.pos.y += this.vel.y
        this.draw()
    }
}

class Enemy {
    constructor(pos, target){
        this.pos = pos
        this.vel = {x: 0, y: 0}
        this.width = 20
        this.height = 40
        this.isFalling = true
        this.isJumping = false
        this.target = target
    }

    draw() {
        c.fillStyle = "red"
        c.fillRect(this.pos.x, this.pos.y, this.width, this.height)
    }

    update() {

        //jatekos kovetese
        if (this.target.pos.x > this.pos.x)
            this.vel.x = 1
        else
            this.vel.x = -1

        this.isFalling = isFalling(this, tile_list)

        if (!this.isFalling && !this.isJumping){
            this.vel.y = 0
        }else if (!this.isJumping){
            this.vel.y += g
        }

        if (canMove(this, tile_list)){
            this.pos.x += this.vel.x
        }else
            this.vel.x = 0

        if (this.vel.y>0)
            this.pos.y += this.vel.y
        else if (canMove(this, tile_list))
            this.pos.y += this.vel.y
            
        this.isJumping = false

        this.draw()
    }

    checkForBullet(bullet_list){
        for (let i = 0; i < bullet_list.length; i++){
            let b = bullet_list[i]
            let x = b.pos.x
            let y = b.pos.y
            if (b.pos.x < this.pos.x)
                x = this.pos.x
            else if (b.pos.x > this.pos.x+this.width)
                x = this.pos.x+this.width
            
            if (b.pos.y < this.pos.y)
                y = this.pos.y
            else if (b.pos.y > this.pos.y + this.height)
                y = this.pos.y + this.height

            let distSquared = (x-b.pos.x)**2 + (y-b.pos.y)**2
            if (distSquared <= b.r**2)
                return true
        }
        return false
    }
}

function addTile(x, y, tile_list) {
    tile = {x: x-x%tile_height, y: y-y%tile_height}
    if (!tile_list.some(e => (e.x == tile.x && e.y == tile.y))){
        tile_list.push(tile)
    }
}

function canMove(player, tile_list) {
    x1 = player.pos.x + player.vel.x
    y1 = player.pos.y + player.vel.y
    x2 = x1 + player.width
    y2 = y1 + player.height
    for (i=0; i<tile_list.length; i++){
        tile = tile_list[i]
        u1 = tile.x
        v1 = tile.y
        u2 = u1 + tile_height
        v2 = v1 + tile_height

        if (x1 <= u2 && x2 >= u1 && y1 <= v2 && y2 >= v1){
            return false
        }
    }
    return true
}

function isFalling(player, tile_list) {
    for (i=0; i<tile_list.length; i++){
        tile = tile_list[i]
        if (tile.y >= player.pos.y && player.pos.y + player.height >= tile.y-tile_height/4){
            if (player.pos.x + player.width >= tile.x && player.pos.x <= tile.x+tile_height){
                player.pos.y = tile.y-player.height-1
                return false
            }
        } 
    }
    return true
}

const player = new Player({x: 200, y: 600})
bullet_list = []
tile_list = []
enemy_list = [] 
for (i=0; i<canvas.width/tile_height; i++) {
    addTile(i*tile_height, canvas.height-canvas.height%tile_height, tile_list)
}

function gameLoop(timeStamp) {
    window.requestAnimationFrame(gameLoop)

    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;

    //hatter
    c.fillStyle = "#eafbfb"
    c.fillRect(0, 0, canvas.width, canvas.height)    

    //mozgas
    if (w_pressed || space_pressed)
        player.jump()
    if (a_pressed && d_pressed)
        player.vel.x = 0
    else if (a_pressed)
        player.vel.x = -5
    else if (d_pressed)
        player.vel.x = 5
    else
        player.vel.x = 0

    //ellenfelek megjelenese   
    if (secondsPassed)
        timer += secondsPassed
    if (timer >= 4) {
        enemy = new Enemy({x: Math.random()*canvas.width, y: 10}, player)
        enemy_list.push(enemy)
        timer = 0
    }

    //jatekos
    player.update()

    //ellenfelek
    for (let i=0; i<enemy_list.length;i++){
        e = enemy_list[i]
        e.update()
        if(e.checkForBullet(bullet_list)){
            if (i == 0)
                e.pos.y = canvas.height+100
            enemy_list.splice(i, i)
        }
    }

    //palya rajzolasa
    for (i = 0; i<tile_list.length; i++){
        c.strokeRect(tile_list[i].x, tile_list[i].y, tile_height, tile_height)
    }

    //lovedekek
    for (i = 0; i<bullet_list.length; i++) {
        b = bullet_list[i]
        b.update()
        if (b.pos.x > canvas.width+b.r || b.pos.y > canvas.height+b.r
            || b.pos.x < 0-b.r || b.pos.y < 0-b.r)
            bullet_list.splice(i, i)
    }
}

//controls
window.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "w":
            w_pressed = true
            break
        case " ":
            space_pressed = true
            break
        case "a":
            a_pressed = true
            break
        case "d":
            d_pressed = true
            break
    }
}) 

window.addEventListener("keyup", (event) => {
    switch (event.key) {
        case "w":
            w_pressed =  false
            break
        case " ":
            space_pressed = false
            break
        case "a":
            a_pressed = false
            break
        case "d":
            d_pressed = false
            break
    }
})

window.addEventListener("mousemove", (event) => {
    mouse_x = event.clientX
    mouse_y = event.clientY
    if (right_mouse_down){
        addTile(mouse_x, mouse_y, tile_list)
    }
})

window.addEventListener("mousedown", (event) => {
    switch (event.button){
        case 0:
            bullet_list.push(new Bullet(player, {x: mouse_x, y: mouse_y}))
            break
        case 2:
            addTile(mouse_x, mouse_y, tile_list)
            right_mouse_down = true
            break
    }
})

window.addEventListener("mouseup", (event) => {
    if (event.button == 2)
        right_mouse_down = false
})

canvas.addEventListener("contextmenu", e => e.preventDefault());

gameLoop()