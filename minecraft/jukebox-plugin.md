@Title = Jukebox Plugin
@Author = Connor Slade
@Date = 07-01-22
@Description = Playing midi through Minecraft
@Tags = Minecraft
@Path = minecraft/jukebox-plugin
@Assets = .

---

# 🎻 Jukebox Plugin

Have you ever wanted to play midi remakes of your favorite songs through Minecraft?
Well I certainly haven't but I'm going to do it anyway.

I made a bukkit plugin to read [Note block Studio](https://opennbs.org/) files and use a nice in game UI to let players pick songs to be played.
It then sends packets to all the players to have their clients play note block sounds.

## The UI

## Loading the songs

There is a nice document explaining the .nbs file format [here](https://opennbs.org/nbs).
It is made up of 4 sections, but only 2 really matter here: Header and Noteblocks.
The header had stuff like the song name, song author, tempo, length, etc.
And the noteblock section held each noteblock and info about it (insterment, key).

Now one may think that reading such a simple file format would be easy,,, but those people don't know java.
This turned out to be the most difficult part of this whole project, and it's all because of the `BufferedInputStream`.

I thought this class would make it easy to read the 2-byte shorts and the 4-byte ints from the file data easily, but it just wouldn't work.
I still have no idea why, it just wouldn't work.
I spent hours working with it and eventually decided to just do it my self.

I first got a byte array from each song file with `Files.readAllBytes`, then went on to parsing it.
I made functions to read the different data types like shorts, ints and strings.
But because java, I couldn't pass a mutable reference to the byte index, so I had to make a new class: `MutInt`.

So here is how it parses the file header:

```java
// Read file to byte array
byte[] bytes = Files.readAllBytes(file.toPath());
MutInt i = new MutInt(0);

// Version check
assert readShort(i, bytes) == 0;

// Get song length
i.increment(4);
this.length = readShort(i, bytes);

// Get song name
i.increment(2);
this.name = readString(i, bytes);
this.author = readString(i, bytes);

// Get tempo
skipStrings(i, bytes, 2);
this.tempo = readShort(i, bytes) / 100f;

i.increment(23);
skipStrings(i, bytes, 1);
i.increment(4);
```

Then on to the noteblock parsing.
This was actually easier than I thought it would be.

```java
ArrayList<Note> notes = new ArrayList<>();
int value = -1;
while (true) {
    short noteJumpTicks = readShort(i, bytes);
    value += noteJumpTicks;
    if (noteJumpTicks == 0) break;

    while (true) {
        short layerJumpTicks = readShort(i, bytes);
        if (layerJumpTicks == 0) break;

        Instrument instrument = readInstrument(i, bytes).orElse(Instrument.Piano);
        byte key = readByte(i, bytes);
        i.increment(2);
        short pitch = readShort(i, bytes, true);

        notes.add(new Note(value, instrument, key, pitch));
    }
}
```

### Converting songs

## Playing music

## Conclusion
