class Brick
{
    constructor(x,y,type)
    {
        this.x = x;
        this.y = y;
        this.hp = isNaN(type)||type>6 ? 1 : type; //Jeśli typ jest cyfrą to oznacza HP cegły. 
        this.type = isNaN(type) ? type : 0; //Jeśli jest literą, oznacza typ wypadającego z niej bonusu.
        this.inv = false; //Niewrażliwe cegły nie tracą HP w kontakcie z piłką.
        if(this.type == "U") //U oznacza niezniszczalne cegły.
        {
            this.color = c.createLinearGradient(this.x+brickWidth/2,this.y,this.x+brickWidth/2,this.y+brickHeight);
            this.color.addColorStop(0,`hsl(0,0%,50%)`);
            this.color.addColorStop(0.2,`hsl(0,0%,90%)`);
            this.color.addColorStop(0.4,`hsl(0,0%,50%)`);
            this.color.addColorStop(1,`hsl(0,0%,20%)`);
            
            //[[0,5],[0.2,9],[0.4,5],[1,2]].forEach(a=>this.color.addColorStop(a[0],`hsl(0,0%,${a[1]}0%)`)); Krótsza i znacznie mniej czytelna wersja dodawania kolorów do gradientu
        }
        else if(this.type) //Jeśli cegła ma konkretny typ, to jest tęczowa.
        {
            this.color = c.createLinearGradient(this.x+brickWidth/2,this.y,this.x+brickWidth/2,this.y+brickHeight);
            for(let i=0;i<6;i++)
                this.color.addColorStop(i*0.2,`hsl(${i*72},100%,50%)`);
            
            this.shine = c.createLinearGradient(this.x+brickWidth/2,this.y,this.x+brickWidth/2,this.y+brickHeight); //Połysk tęczowej cegły.
            this.shine.addColorStop(0,"rgba(0,0,0,0)");
            this.shine.addColorStop(0.2,"rgba(255,255,255,1");
            this.shine.addColorStop(0.5,"rgba(0,0,0,0)");
            this.shine.addColorStop(1,"rgba(0,0,0,1)");
        }
        else //W przeciwnym wypadku jej kolor zależy od jej HP.
        {
            this.color = c.createLinearGradient(this.x+brickWidth/2,this.y,this.x+brickWidth/2,this.y+brickHeight);
            this.color.addColorStop(0,`hsl(${this.hp*60},100%,50%)`);
            this.color.addColorStop(0.2,`hsl(${this.hp*60},100%,90%)`);
            this.color.addColorStop(0.4,`hsl(${this.hp*60},100%,50%)`);
            this.color.addColorStop(1,`hsl(${this.hp*60},100%,20%)`);
        }
    }

    update()
    {
        this.hp--;
        this.color = c.createLinearGradient(this.x+brickWidth/2,this.y,this.x+brickWidth/2,this.y+brickHeight);
        this.color.addColorStop(0,`hsl(${this.hp*60},100%,50%)`);
        this.color.addColorStop(0.2,`hsl(${this.hp*60},100%,90%)`);
        this.color.addColorStop(0.4,`hsl(${this.hp*60},100%,50%)`);
        this.color.addColorStop(1,`hsl(${this.hp*60},100%,20%)`);
        score += 10; //Pukty za trafienie cegły
        if(this.hp <= 0)
        {
            bricks.delete(this);
            score += 10; //Punkty za zniszeczenie cegły.
            if(this.type)bonuses.add(new Bonus(this.x,this.y,this.type)); //Jeśli cegła miała typ, to tworzy bonus danego typu po zniszczeniu.
        }
    }

    draw()
    {
        c.fillStyle = this.color;
        c.fillRect(this.x,this.y,brickWidth,brickHeight);
        if(this.type == "U")
        {
            c.fillStyle = "#777777";
            let r = 4*scale;
            c.beginPath();
            c.arc(this.x+r,this.y+r,r/2,0,Math.PI*2);
            c.fill();
            c.beginPath();
            c.arc(this.x+brickWidth-r,this.y+r,r/2,0,Math.PI*2);
            c.fill();
            c.beginPath();
            c.arc(this.x+r,this.y+brickHeight-r,r/2,0,Math.PI*2);
            c.fill();
            c.beginPath();
            c.arc(this.x+brickWidth-r,this.y+brickHeight-r,r/2,0,Math.PI*2);
            c.fill();
        }
        else if(this.type)
        {
            c.globalAlpha = 0.3; //Połysk rysowany jest jako przeźroczysta nakładka na tęczową cegłę.
            c.fillStyle = this.shine;
            c.fillRect(this.x,this.y,brickWidth,brickHeight);
            c.globalAlpha = 1;
            c.strokeStyle = "white";
            c.lineWidth = 1;
            c.strokeRect(this.x,this.y,brickWidth,brickHeight);
        }
    }
}