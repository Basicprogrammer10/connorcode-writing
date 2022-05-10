@Title = Minecraft Random Icon
@Author = Connor Slade
@Date = 05-06-22
@Description = Randomizing the Minecraft server Icon and MOTD
@Tags = Minecraft, Fabric, Modding
@Path = programming/minecraft-random-icon
@Assets = .

---

<style>
.no-round {
  border-radius: 4px !important;
}
</style>

# 🥌 Minecraft Random Icon

so its been what like 3 weeks.
guess my one article a week is fallen behind a little :\

Anywhoo on to this little project.
Minecraft servers have the ability to show a MOTD (Message of the day) and a 64\*64 PX icon on the server selector page.
A few servers show randomized MOTDs (2b2t + clones) but I am yet to come across one with a randomized icon.
Sooooooooo let's make it!

I have already made a MOTD randomizer in the past but it used the craftbukkit API so it was super easy.
For this I need it to be a fabric mod so we will be using mixins. _wooooooo..._

## 🚁 Implementation

After a little but of CTRL clicking through the Minecraft code I found the following functions in the `ServerMetadata` class: `getFavicon` and `getDescription`.
As the name implies these are the functions used to get the data to respond with when a server is pinged.
Both return text (Description: Text, Favicon: String) so I was wondering how the image was stored, and it turns out its in base 64 encoding.
So now that we know all that let's work on the implementation.

### The Motd

I started with the easy part: the MOTD.
The motd options are stored in a text file that gets embedded in the jar.
On mod init this file is read and added to a static variable.

```java
public static final List<String> motds =
    new BufferedReader(new InputStreamReader(Objects.requireNonNull(
                           classLoader.getResourceAsStream("motd.txt"))))
        .lines()
        .toList();
```

Now for the mixin part.
Although it's not a good practice I used Overwrite because the function just returned one thing.
In the new function it just picks a random MOTD to return.
that's it

```java
@Mixin(ServerMetadata.class)
public class Motd {
  // SNIP //

  @Overwrite
  public @Nullable Text getDescription() {
    return Text.of(motds.get(rand.nextInt(0, motds.size())));
  }

  // SNIP //
}
```

### The Favicon

This part turned out to be really quite difficult.
The first step was loading images and this required having images.
I took some of the Minecraft block textures and scaled them to the right size with a little _ImageMagick, Magic_.

Like before I wanted to embed them in the jar but as it turns out,,, _java bad_.
I put the images in a folder and had it get the folder as a `File` and dynamically get and load the files within.
This worked great until I put it in a JAR, in the JAR it was unable to get the folder as a file.
After some duckduckgoing I found the only way to do this was to load the jar into memory, decompress it and get the files that way.
That solution is kinda insane to I gave up on the whole dynamic loading thing and just made a huge array of all the file names to load.
This worked perfectly and I just had to convert the image to a base64 string and store it in an array.

I ended coming up with this mess:

```java
// Make an empty array
public static List<String> favs = new ArrayList<>();

static {
  // Loop through all image names
  for (String i : imageNames)
    try {
      // Read the image bytes
      ByteBuf byteBuf = Unpooled.buffer();
      BufferedImage img = ImageIO.read(new ByteArrayInputStream(
          Objects
              .requireNonNull(
                  classLoader.getResourceAsStream("favicon/" + i + ".png"))
              .readAllBytes()));
      ImageIO.write(img, "PNG", new ByteBufOutputStream(byteBuf));

      // Encode the image as Base64
      ByteBuffer byteBuffer = Base64.getEncoder().encode(byteBuf.nioBuffer());

      // Add image to array
      favs.add("data:image/png;base64," +
               StandardCharsets.UTF_8.decode(byteBuffer));
    } catch (IOException e) {
      e.printStackTrace();
    }
}
```

And finally the mixin to randomize the Favicons.

```java
@Mixin(ServerMetadata.class)
public class Motd {
  // SNIP //

  @Overwrite
  @Nullable
  public String getFavicon() {
    return favs.get(rand.nextInt(0, favs.size()));
  }
}
```

## 🧲 Showcase

<img class="no-round" src="../assets/programming/minecraft-random-icon/showcase_0.png"></img>

<img class="no-round" src="../assets/programming/minecraft-random-icon/showcase_1.png"></img>

## 💎 Conclusion

in conclusion `java == bad`,,, or something

This was such a small project that I don't have it on git or anything.
The images and text are built-in so it's not configurable at all.
If you want to use this just make your own mod and ~~steal~~ barrow some code from here.
could also just message me [here](https://connorcode.com/contact/).

thats all
