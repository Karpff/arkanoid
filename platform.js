class Platform
{
    constructor()
    {
        this.width = platformWidth;
        this.height = platformHeight;
        this.x = sizeX/2-platformWidth/2;
        this.y = sizeY-platformHeight*3.5;
        this.leftV = 0;
        this.rightV = 0;
        this.shrinkTime = 0; //Zegary wyznaczające czas trwania bonusów.
        this.growTime = 0;
        this.magnet = 0;
        this.super = 0;

        this.mainColor = c.createLinearGradient(this.x+this.width/2,this.y,this.x+this.width/2,this.y+this.height);
        this.mainColor.addColorStop(0,"grey");
        this.mainColor.addColorStop(0.2,"white");
        this.mainColor.addColorStop(0.9,"grey");
        this.mainColor.addColorStop(1,"darkgrey");

        this.sideColor = c.createLinearGradient(this.x+this.width/2,this.y-1,this.x+this.width/2,this.y+this.height+2);
        this.sideColor.addColorStop(0,"red");
        this.sideColor.addColorStop(0.2,"white");
        this.sideColor.addColorStop(0.9,"red");
        this.sideColor.addColorStop(1,"darkred");

        this.sideColorMagnet = c.createLinearGradient(this.x+this.width/2,this.y-1,this.x+this.width/2,this.y+this.height+2);
        this.sideColorMagnet.addColorStop(0,"blue");
        this.sideColorMagnet.addColorStop(0.2,"white");
        this.sideColorMagnet.addColorStop(0.9,"blue");
        this.sideColorMagnet.addColorStop(1,"darkblue");

        this.superColor = c.createLinearGradient(this.x+this.width/2,this.y-1,this.x+this.width/2,this.y+this.height+2);
        this.superColor.addColorStop(0,"gold");
        this.superColor.addColorStop(0.2,"white");
        this.superColor.addColorStop(0.9,"gold");
        this.superColor.addColorStop(1,"#666600");
    }

    shrink(time) //Kurczenie się platformy.
    {
        this.x += platform.width*0.15; //Podczas kurczenia platformy należy przesunąć ją w prawo aby sprawić wrażenia kurczenia się z obu stron.
        this.shrinkTime = time;
    }

    grow(time)
    {
        this.x -= platform.width*0.15; //Jak wyżej.
        this.growTime = time;
    }

    update()
    {
        this.shrinkTime--; //Wszystkie zegary "tykają"
        this.growTime--;
        this.magnet--;
        this.super--;
        if(this.shrinkTime > 0 && this.growTime <= 0)this.width = platformWidth*0.7;
        else if(this.shrinkTime <= 0 && this.growTime > 0)this.width = platformWidth*1.3;
        else this.width = platformWidth; //Jeśli platofma jest jednocześnie powiększona i pomniejszona, pozostaje swojego domyślenego rozmiaru.
        if(this.shrinkTime == 0)this.x -= platform.width*0.15; //Przywracanie paletki do oryginalnej pozycji przy rozkurczaniu
        if(this.growTime == 0)this.x += platform.width*0.15; //Jak wyżej

        this.x += (this.rightV-this.leftV)*platformSpeed * (this.shrinkTime > 0 ? 1.3 : 1); //Mniejsza paletka porusza się szyciej.
        if(this.x + this.width > sizeX)this.x = sizeX - this.width; //Zatrzymywanie się na ścianach
        if(this.x < 0)this.x = 0;
    }

    draw()
    {
        if(this.super > 0)c.fillStyle = this.superColor; 
        else c.fillStyle = this.mainColor;
        c.fillRect(this.x,this.y,this.width,this.height);

        c.fillStyle = this.sideColor;
        c.fillRect(this.x,this.y-1,this.height+2,this.height+2);
        if(this.magnet > 0)c.fillStyle = this.sideColorMagnet;
        c.fillRect(this.x+this.width-this.height-2,this.y-1,this.height+2,this.height+2);
    }
}