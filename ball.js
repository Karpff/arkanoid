class Ball
{
    constructor(x,y,frozen)
    {
        this.x = x;
        this.y = y;
        this.spdX = 0;
        this.spdY = 0;
        this.frozen = frozen; //"Zamrożona" piłka nie porusza się normalnie, a przylega do platformy.
        this.super = false; //"Superpiłka" przelatuje przez cegły.
        this.ignores = new Set(); //Zbiór "ignorowanych" cegieł.
    }

    launch(direction)
    {
        this.spdX = Math.cos(direction)*ballSpeed;
        this.spdY = Math.sin(direction)*ballSpeed;
        this.frozen = false;
    }

    update(interval)
    {
        if(this.frozen)
        {
            this.x = platform.x + platform.width/2;
            this.y = platform.y - ballSize;
            if(platform.super > 0)this.super = true;
            else this.super = false;
        }
        else
        {
            this.x += this.spdX*interval/20;
            this.y += this.spdY*interval/20;

            if(tracker > 0) //Logika trackera
            {
                let travelAngle = Math.atan2(this.spdY,this.spdX);
                c.beginPath();
                c.moveTo(this.x,this.y);
                c.lineTo(this.x+Math.cos(travelAngle)*1250*scale,this.y+Math.sin(travelAngle)*1250*scale);
                c.strokeStyle = "rgba(255,100,100,0.1)";
                c.lineWidth = ballSize/2;
                c.stroke();
            }

            if(platform.magnet > 0 && this.y > sizeY/2 && this.spdY > 0) //Logika magnesu.
            {
                let travelAngle = Math.atan2(this.spdY,this.spdX);
                let predictedX = 1/Math.tan(travelAngle)*(platform.y-this.y) + this.x; //Obliczam gdzie uderzy piłka.

                if(predictedX > 0 && predictedX < sizeX)
                {
                    travelAngle +=  (predictedX < platform.x + platform.width/4) ? -0.02 : ((predictedX > platform.x + platform.width/4*3) ? 0.02 : 0); //Powoli zmieniam kąt poruszaniania się piłki tak, by wylądowała na platformie.
                    this.launch(travelAngle);
                }
            }

            if(this.x + ballSize > sizeX)this.spdX = -Math.abs(this.spdX); //Odbijanie się od ścian
            if(this.x - ballSize < 0)this.spdX = Math.abs(this.spdX);
            if(this.y - ballSize < 0)this.spdY = Math.abs(this.spdY);
            if(this.y + ballSize >= platform.y) //Odbijanie się od paletki
            {
                if(this.x > platform.x && this.x < platform.x + platform.width && this.y-this.spdY + ballSize < platform.y) //Jeśli piłka odbija się od wierzchu platformy, jej kierunek zależy od miejsca w którym uderzyła platformę (bliżej środka - bardziej na wprost).
                    this.launch((this.x - platform.x)/platform.width*Math.PI*3/4 -Math.PI*7/8);
                else if(this.x + ballSize > platform.x && this.x - ballSize < platform.x + platform.width) //Jeśli piłka nie odbija się od wierzchu platformy...
                {
                    if(platform.y > this.y) //Jeśli odbija się od rogu platformy
                    {
                        let py = platform.y;
                        let px = this.x <= platform.x ? platform.x : platform.x + platform.width;
                        if(ballSize > Math.sqrt(Math.pow(px-this.x,2)+Math.pow(py-this.y,2)))
                            this.launch(Math.atan2(this.y-py,this.x-px));
                    }
                    else //Jeśli odbija się od boku platformy
                    {
                        if(this.x < platform.x && this.x + ballSize > platform.x)this.spdX = -Math.abs(this.spdX);
                        if(this.x > platform.x + platform.width && this.x - ballSize < platform.x + platform.width)this.spdX = Math.abs(this.spdX);
                    }
                }
                if(platform.super > 0)this.super = true; //Jeśli piłka odbija się od "superplatformy" staje się "superpiłką"
                else this.super = false;
            }
            if(this.y - ballSize > sizeY)balls.delete(this); //Jeśli piłka wypadła poza ekran, zostaje usunięta.

            bricks.forEach(b=> //Logika kolizji z cegłami
            {
                if(this.ignores.has(b)) //Piłka nie będzie oddziaływać z ignorowanymi cegłami. Rozwiązuje to rzadki problem, który sprawia że piłka utyka w cegle.
                {
                    this.ignores.delete(b);
                }
                else if(this.x + ballSize >= b.x && this.x - ballSize <= b.x + brickWidth && this.y + ballSize >= b.y && this.y - ballSize <= b.y + brickHeight) //Dla optymalizacji na początku sprawdzam czy piłka znajduje się dość blisko aby móc uderzyć daną cegłę
                {
                    let px = this.x < b.x ? b.x : (this.x > b.x + brickWidth ? b.x + brickWidth : this.x); //Idealnie okrągła kula zawsze uderzy idealnie gładką powierzchnie tylko jednym punktem. Ten punkt to (px, py)
                    let py = this.y < b.y ? b.y : (this.y > b.y + brickHeight ? b.y + brickHeight : this.y); 
                    if(Math.sqrt(Math.pow(px-this.x,2)+Math.pow(py-this.y,2))<ballSize) //Sprawdzam czy piłka styka się z wyznaczonym punktem.
                    {
                        if(!b.inv && b.type != "U")b.update(); //Cegła traci życie tylko jeśli nie jest niewrażliwa lub niezniszczalna.
                        if(!this.super || b.type == "U") //Jeśli nie mamy do czynienia z "superpiłką", piłka odbija się w realistyczny fizycznie sposób.
                        {
                            let travelAngle = Math.atan2(this.spdY,this.spdX);
                            let collisionAngle = Math.atan2(py-this.y,px-this.x);
                            let collisionSpeed = Math.cos(travelAngle-collisionAngle)*ballSpeed;
                            this.spdX -= 2*Math.cos(collisionAngle)*collisionSpeed;
                            this.spdY -= 2*Math.sin(collisionAngle)*collisionSpeed;
                            this.ignores.add(b); //Po odbiciu się od od cegły, dodajemy ją do tablicy ignorowanych tej piłki na czas kolejnej iteracji.
                        }
                        b.inv = true; //Jeśli mamy do czynienia z "superpiłką", nadajemy cegle przez którą przelatuje niewrażliwość, aby przelatując nie obniżała dalej jej HP.
                    }
                    else b.inv = false; //Gdy cegła nie znajduje się już w zasięgu piłki, zdejmujemy jej niewrażliwość.
                }
                else b.inv = false; //Jak wyżej.
            });
        }
    }

    draw()
    {
        c.beginPath();
        c.arc(this.x,this.y,ballSize,0,Math.PI*2);
        let grd;
        if(this.super)
        {
            grd = c.createRadialGradient(this.x-ballSize/2,this.y-ballSize/2,ballSize/5,this.x,this.y,ballSize);
            grd.addColorStop(0.2,"white");
            grd.addColorStop(0.9,"gold");
            grd.addColorStop(1,"#666600"); 
        }
        else
        {
            grd = c.createRadialGradient(this.x-ballSize/2,this.y-ballSize/2,ballSize/5,this.x,this.y,ballSize);
            grd.addColorStop(0.2,"white");
            grd.addColorStop(0.9,"grey");
            grd.addColorStop(1,"darkgrey");
        }
        c.fillStyle = grd;
        c.fill();
    }
}