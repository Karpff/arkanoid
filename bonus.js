const bonusTypes = ["S","G","M","B","L","X","T"];

class Bonus
{
    constructor(x,y,type)
    {
        this.x = x;
        this.y = y;
        this.type = type;
        if(this.type == "R")this.type = bonusTypes[Math.floor(Math.random()*bonusTypes.length)]; //Typ "R" oznacza losowy bonus.
        this.color = Math.random()*360;
    }

    update(interval)
    {
        this.y += 4*interval/20*scale;
        this.color-=5; //Główny kolor bonusu cały czas się zmienia
        if(this.y>sizeY)bonuses.delete(this);
        if(this.y + brickHeight*0.8 > platform.y && this.y < platform.y + platformHeight && this.x + brickWidth*0.6 > platform.x && this.x < platform.x + platform.width) //Logika chwytania bonusów przez platformę.
        {
            bonuses.delete(this);
            switch(this.type)
            {                  
                case "S": //Pomniejsza i przyśpiesza platformę.
                    platform.shrink(500);
                    break;
                case "G": //Powiększa platformę
                    platform.grow(700);
                    break;
                case "M": //Włącza "magnes". Piłki są przyciągane przez magnetyczną platformę.
                    platform.magnet = 600;
                    break;
                case "L": //Dodatkowe życie
                    lives++;
                    break;
                case "B": //Dodatkowa piłka (zamrożona aż do wystrzelenia)
                    balls.add(new Ball(platform.x+platform.width/2,platform.y-ballSize,true));
                    break;
                case "X": //"Superplatforma". Superplatforma tworzy "superpiłki", które przenikają przez cegły zamiast się od nich odbijać.
                    platform.super = 500;
                    break;
                case "T": //Tracker. Wyświetla przewidziany tor lotu piłki.
                    tracker = 1000;
                    break;
            }
            score += 50; //Punkty za zebranie bonusu.
        }
    }

    draw()
    {
        c.lineWidth = 1;
        let grd = c.createRadialGradient(this.x+brickWidth*0.3,this.y+brickHeight*0.4,0,this.x+brickWidth*0.3,this.y+brickHeight*0.4,brickWidth/2);
        for(let i=0;i<10;i++) //Bonusy mienią się na tęczowo.
            grd.addColorStop(i*0.1,`hsl(${this.color+i*36},80%,40%)`);
        c.fillStyle = grd;
        c.fillRect(this.x,this.y,brickWidth*0.6,brickHeight*0.8);
        c.strokeStyle = "white";
        c.strokeRect(this.x,this.y,brickWidth*0.6,brickHeight*0.8);
        c.fillStyle = "white";
        c.font = `bold ${brickHeight*0.8}px Impact`;
        c.textBaseline = "middle";
        c.textAlign = "center";
        c.fillText(this.type,this.x+brickWidth*0.3,this.y+brickHeight*0.4);
        c.strokeStyle = "black";
        c.strokeText(this.type,this.x+brickWidth*0.3,this.y+brickHeight*0.4);
    }
}