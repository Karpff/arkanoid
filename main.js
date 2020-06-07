var canvas = document.createElement("canvas");
var c = canvas.getContext('2d');
const sizeX = Math.min(innerWidth,innerHeight*4/3); //Gra zawsze przyjmie największą możliwą rozdzielczość pozostając w formacie 4:3.
const sizeY = Math.min(innerWidth*3/4,innerHeight);
const scale = sizeX/1000; 
canvas.width = sizeX;
canvas.height = sizeY
document.body.appendChild(canvas);

const platformWidth = 150*scale;
const platformHeight = 15*scale;
const platformSpeed = 7*scale;

const ballSize = 10*scale;
const ballSpeed = 10*scale;

const brickMargin = sizeX/13*0.05; //Maksymalna ilość cegieł w poziomie to 13. Każda przeznacza 5% dostępnej powierzchni na margines prawy margines.
const brickWidth = sizeX/13*0.95-brickMargin*1/13; //Pozostałe 95% to szerokość cegły. Pierwsza cegła musi posiadać margines również po lewej stronie, więc wszystkie cegły "składają się" po 1/13 swojej powierzchni przeznaczonej na margines
const brickHeight = sizeY*0.035; //W pionie ilość cegieł nie jest ograniczona do 13.

var lives = 2;
var score = 0;
var gameOver = false;
var tracker = 0;
var level = -1; //Poziom ustawiany jest na -1, i zmieniany na 0 przy wczytywaniu przerwszego poziomu.
var brickLayout; //Przechowuje ułożenie cegieł dla danego poziomu.
var bricks = new Set(); //Zdecydowałem się na użycie zbiorów, ponieważ pozwalają one na łatwe usuwanie elementów.
var balls = new Set();
var bonuses = new Set();
var unbreakables; //Ilość niezniszczalnych cegieł.

var platform = new Platform(); //Paletka/Rakieta

const levelUp = _=>
{
    level++;
    brickLayout = levels[level];
    bricks.clear();
    balls.clear();
    unbreakables = 0;

    balls.add(new Ball(platform.x+platform.width/2,platform.y-ballSize,true));
    brickLayout.forEach((row,i)=>
    {
        row.forEach((brick,j)=>
        {
            if(brick)
                bricks.add(new Brick(brickMargin+j*(brickWidth+brickMargin),brickMargin+i*(brickHeight+brickMargin),brick));
            if(brick=="U")unbreakables++;
        });
    });
    score += level*200;
}
levelUp(); //Rozpoczęcie pierwszego poziomu

window.addEventListener('keydown',e=>
{
    if(e.keyCode == '65' || e.keyCode == '37')platform.leftV = 1; //Poruszanie klawiszami AD lub strzałkami.
    if(e.keyCode == '68' || e.keyCode == '39')platform.rightV = 1; //Rozdzieliłem kierunki na lewo i prawo aby utworzyć bardziej intuicyjne sterowanie.
    if(e.keyCode == '32') //Spacja wystrzeliwuje kulę w mniej-więcej losowym kierunku.
        balls.forEach(b=>{if(b.frozen)b.launch(Math.random()*Math.PI/4-Math.PI/2-Math.PI/8)});
});

window.addEventListener('keyup',e=>
{
    if(e.keyCode == '65' || e.keyCode == '37')platform.leftV = 0;
    if(e.keyCode == '68' || e.keyCode == '39')platform.rightV = 0;
});

const scoreFill = c.createLinearGradient(sizeX,sizeY-22,sizeX,sizeY-2); //Gradient do wyświetlania ilości punktów
scoreFill.addColorStop(0,"hsl(120,100%,50%)");
scoreFill.addColorStop(0.2,"hsl(120,100%,80%)");
scoreFill.addColorStop(0.5,"hsl(120,100%,50%)");
scoreFill.addColorStop(1,"hsl(120,100%,30%)");

const winFill = c.createLinearGradient(sizeX/2,sizeY/2-24,sizeX/2,sizeY/2+40);
winFill.addColorStop(0,"yellow");
winFill.addColorStop(0.2,"white");
winFill.addColorStop(0.4,"yellow");
winFill.addColorStop(1,"black");

const looseFill = c.createLinearGradient(sizeX/2,sizeY/2-24,sizeX/2,sizeY/2+40);
looseFill.addColorStop(0,"grey");
looseFill.addColorStop(0.2,"white");
looseFill.addColorStop(0.4,"grey");
looseFill.addColorStop(1,"black");

let lastTime = new Date().getTime();

const animate = _=>
{
    let interval = new Date().getTime() - lastTime;
    lastTime = new Date().getTime();
    tracker--;

    c.fillStyle = "#303336";
    c.fillRect(0,0,sizeX,sizeY);

    platform.update();
    platform.draw();
    balls.forEach(b=>b.update(interval));
    bricks.forEach(b=>b.draw());
    balls.forEach(b=>b.draw());
    bonuses.forEach(b=>b.update(interval));
    bonuses.forEach(b=>b.draw());

    c.textAlign = "right";
    c.textBaseline = "bottom";
    c.fillStyle = scoreFill;    
    let scoreText = score+"";
    scoreText = "0".repeat(6-scoreText.length)+scoreText;
    c.font = `${26*scale}px Consolas`; //Punkty są wyświetlane czacionką monospace i zawsze są liczbą sześciocyfrową
    c.fillText(`${scoreText}`,sizeX-5,sizeY-2);

    for(let i=0;i<lives;i++) //Pętla wyświetlająca ilość żyć w postaci kul.
    {
        c.beginPath();
        c.arc(i*ballSize*3+ballSize*2,sizeY-ballSize*2,ballSize,0,Math.PI*2);
        let grd = c.createRadialGradient(i*ballSize*3+ballSize*3/2,sizeY-ballSize*2-ballSize/2,ballSize/5,i*ballSize*3+ballSize*2,sizeY-ballSize*2,ballSize);
        grd.addColorStop(0.2,"white");
        grd.addColorStop(0.9,"grey");
        grd.addColorStop(1,"darkgrey");
        c.fillStyle = grd;
        c.fill();
    }
    if(bricks.size <= unbreakables) //Warunek zwycięstwa/Przejścia do kolejnego poziomu.
    {
        if(level < levels.length-1)levelUp();
        else 
        {
            c.font = `bold ${80*scale}px Arial`;
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillStyle = winFill;
            c.fillText("VICTORY!",sizeX/2,sizeY/2);
            gameOver = true;
        }
    }
    if(balls.size <= 0) //Warunek przegranej/Utraty życia
    {
        if(lives > 0)
        {
            lives--;
            balls.add(new Ball(platform.x+platform.width/2,platform.y-ballSize,true));
        }
        else
        {
            c.font = `bold ${80*scale}px Arial`;
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillStyle = looseFill;
            c.fillText("GAME OVER",sizeX/2,sizeY/2);
            gameOver = true;
        }
    }
    if(!gameOver)window.requestAnimationFrame(animate);
}
animate();
