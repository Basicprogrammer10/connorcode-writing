@Title = Fast Doll
@Author = Connor Slade
@Date = 03-20-23
@Description = Rendering the inventory player modal at full speed
@Tags = Minecraft
@Path = minecraft/fast-doll
@Assets = .

---

# Fast Doll

A while ago I was trying to add a bedrock like player model to my Utility Mod, [SigmaUtils](https://github.com/Basicprogrammer10/SigmaUtils).
While doing this I found that the inventory player model was only updating every tick, causing it to look laggy / choppy.
Five months later I finally fixed it, and released a mod so _the world_ can finally play minecraft the way it was meant to be played.

<div ad info>
Info

You can download the mod from Modrinth [here](https://modrinth.com/mod/fast-doll).
If you want to see it on GitHub, you can find it [here](https://github.com/Basicprogrammer10/minecraft-mods/tree/master/fast-doll).

<div>

## Why this Happens

<div ad note>
Note

I will be using [Yarn Mappings](https://github.com/FabricMC/yarn) for the class, field, variable, and method names in this post.

</div>

So you might be wondering why this is happening in the first place.
To explain that we will first need to see how minecraft renders normally renders entities.
In `MinecraftClient`'s main `render` loop, its padded a boolean that determines if the game should tick or not.
It this boolean is true, then we can the client's tick method, otherwise we are between ticks and we should just render the game.

The problem with this is that movement of entities would look choppy if it were only updated per tick.
Mojang's solution was to create a `tickDelta`, which is the percentage of the way between ticks.
Using this this value, the positions, rotations, and animations of entities can be interpolated between ticks.
This makes the game look much smoother.

You can probably see where this is going.
For some reason when rendering the inventory player model, the `tickDelta` is not passed through, but just set to 1.0.
This causes the model to only update 20 times a second, which is very choppy.

## How I Fixed it

I first tried to fix this problem 5 months ago, but for some reason I diden't get it to work.
But after getting it fixed, it is surprisingly simple.
If Mojang were to fix this it would take only about 20 lines of code.
But because Im doing this through fabric and mixins, it takes a bit more.
The code that renders the player model is in the `InventoryScreen` class is as follows.

```java
// The variables passed to this method are not important
public static void drawEntity(...) {
    // SNIP //
    VertexConsumerProvider.Immediate immediate = client.getBufferBuilders().getEntityVertexConsumers();
    RenderSystem.runAsFancy(() -> {
        entityRenderDispatcher.render(entity, 0.0, 0.0, 0.0, 0.0F, 1.0F, matrices, immediate, 15728880);
                                           // ^ X  ^ Y  ^ Z  ^ Yaw ^ Tick Delta               ^ Light
    });
    immediate.draw();
    // SNIP //
}
```

As you can clearly see, the `tickDelta` is set to 1.0.
Fixing this should just be easy enough, right?
I started by just adding in the tick delta:

```java
client.isPaused() ? client.pausedTickDelta : client.renderTickCounter.tickDelta;
```

Unfortunately this dident really work, it made the model wiggle around a lot.

<video controls src="https://cdn.discordapp.com/attachments/837875259092500493/1086852611522703441/java_AnXS9LPGuy.mp4"></video>

The cause of this wiggling ended up being that the renderer was interpolating between the real players position at the list tick and the normalized of the player model.
Once I figured this out, fixing it was as easy as setting the previous yaws and pitches to the current ones.

```java
float h = entity.prevBodyYaw;
float i = entity.prevYaw;
float j = entity.prevPitch;
float k = entity.prevHeadYaw;
entity.prevBodyYaw = entity.bodyYaw;
entity.prevYaw = entity.getYaw();
entity.prevPitch = entity.getPitch();
entity.prevHeadYaw = entity.headYaw;
entityRenderDispatcher.render(entity, 0.0, 0.0, 0.0, 0.0F, tickDelta, matrices, immediate, 0xF000F0);
entity.prevBodyYaw = h;
entity.prevYaw = i;
entity.prevPitch = j;
entity.prevHeadYaw = k;
```

Just like that, the problem was fixed.

## The Mod

I first added this fix as a module to my Utility Mod, [SigmaUtils](https://github.com/Basicprogrammer10/SigmaUtils), but I wanted to make it a standalone mod so it could be posted onto mod sharing sites like Modrinth and CurseForge.
(Apparently 'Utility' mods aren't welcome :/)
So I made a small standalone mod that just adds this fix.

## Conclusion
