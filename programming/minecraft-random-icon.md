@Title = Minecraft Random Icon
@Author = Connor Slade
@Date = 05-6-22
@Description = Randomizing the Minecraft server Icon and MOTD
@Tags = Minecraft, Fabric, Modding
@Path = programming/minecraft-random-icon
@Assets = .

---

# 🥌 Minecraft Random Icon

so its been what like 3 weaks.
guess my one article a week is fallen behing a little :\

Anywhoo on to this little project.
Minecraft servers have the ability to show a MOTD (Message of the day) and a 64*64 px icon on the server selector page.
A few servers show randomised MOTDs (2b2t + clones) but I am yet to com across one with a randomised icon.
Sooooooooo lets make it!

I have already made a MOTD randomiser in the past but it used the craftbukkit api so it was super easy.
For this I need it to be a fabric mod so we will be useing mixins. *wooooooo...*
After a little but of ctrl clicking therough the minecraft code I found the followig functions in the XX class.
