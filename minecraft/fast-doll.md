@Title = Fast Doll
@Author = Connor Slade
@Date = 03-20-23
@Description = Rendering the inventory player modal at full speed
@Tags = Minecraft
@Path = minecraft/fast-doll
@Assets = .

---

# Fast Doll

A while ago I was trying to add a bedrock like player model to my Utility Mod, [SigmaUtils][sigma-utils].
While doing this I found that the inventory player model was only updating every tick, causing it to look laggy / choppy.
Now, five months later I finally fixed it, and released a mod so _the world_ can finally play minecraft the way it was meant to be played.

<div ad info>
Mod Info

You can download the mod from Modrinth [here][modrinth] (prefered) or from CurseForge [here][curse-forge].
If you want to see the source, you can on GitHub, you can find it [here][source].

</div>

## Why this Happens

<div ad note>
Note

I will be using [Yarn Mappings][yarn] for the class, field, variable, and method names in this post.

</div>

So you might be wondering why this is happening in the first place.
To explain that, we will first need to see how minecraft renders normally renders entities.
In `MinecraftClient`'s main `render` function, a boolean is paseed that determines if the game should tick or not.
If this boolean is true, then we call the client's tick method, otherwise we are between ticks, and we should just render the game.

The problem with this is that movement of entities would look choppy if thair positions and rotations were only updated per tick.
Mojang's solution was to create a `tickDelta`, which is the percentage of the way between ticks.
Using this value, the positions, rotations, and animations of entities can be interpolated between ticks.
This makes the game look much smoother.

You might be able to see where this is going.
For some reason, when rendering the inventory player model, the tick delta is not passed through, but just set to 1.0.
This causes the model to only update 20 times a second, wihch looks very choppy.

## How I Fixed it

I first tried to fix this problem 5 months ago, but for some reason I didn't get it to work.
But after getting it fixed, it is surprisingly simple.
If Mojang were to fix this, it would take only about 20 lines of code.
But because I'm doing this through fabric and [mixins][mixin], it takes a bit more.
The code that renders the player model is in the `InventoryScreen` class. Below is its `drawEntity` function.

```java
// The variables passed to this method are not important
public static void drawEntity(...) {
    // SNIP //
    VertexConsumerProvider.Immediate immediate = client.getBufferBuilders().getEntityVertexConsumers();
    RenderSystem.runAsFancy(() -> {
        entityRenderDispatcher.render(entity, 0.0, 0.0, 0.0, 0.0F, 1.0F, matrices, immediate, 15728880);
    });                                    // ^ X  ^ Y  ^ Z  ^ Yaw ^ Tick Delta               ^ Light
    immediate.draw();
    // SNIP //
}
```

As you can clearly see, the tick delta is being set to 1.0.
Fixing this should just be easy enough, right?
I started by just adding in the tick delta.
The below code shows how to get the tick delta.

```java
client.isPaused() ? client.pausedTickDelta : client.renderTickCounter.tickDelta;
```

Unfortunately, this didn't really work, it made the model wiggle around a lot.

<!-- TODO: Put vieo in repo assets -->

<video controls src="https://cdn.discordapp.com/attachments/837875259092500493/1086852611522703441/java_AnXS9LPGuy.mp4"></video>

The cause of this wiggling ended up being that the renderer was interpolating between the real player's position at the list tick and the normalized of the player model.
This is why the tick delta was being set to 1, to completely ignore the previous position and rotation data.
Once I figured this out, fixing it was as easy as setting the previous yaws and pitches to the current ones, then setting them back after rednering.

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
entity.prevBodyYaw = h;            // ^ X  ^ Y  ^ Z  ^ Yaw ^ Tick Delta                    ^ Light
entity.prevYaw = i;
entity.prevPitch = j;
entity.prevHeadYaw = k;
```

Just like that, the problem was fixed.
You can view the full mixin [here on GitHub][full-mixin]

## The Mod

I first added this fix as a module to my Utility Mod, [SigmaUtils][sigma-utils], but I wanted to make it a standalone mod, so it could be posted onto mod sharing sites like Modrinth and CurseForge.
So I made a small standalone mod that just adds this fix.
Again, you can download the mod on [Modrinth][modrinth] (preferred) / [Curse Forge][curse-forge] or see the full source code on [Github][source].
Here is a video of the mod in action.

## Conclusion

<!-- LINKS -->

[sigma-utils]: https://github.com/Basicprogrammer10/SigmaUtils
[modrinth]: https://modrinth.com/mod/fast-doll
[curse-forge]: https://www.curseforge.com/minecraft/mc-mods/fast-doll
[source]: https://github.com/Basicprogrammer10/minecraft-mods/tree/master/fast-doll
[yarn]: https://github.com/FabricMC/yarn
[mixin]: https://github.com/SpongePowered/Mixin
[full-mixin]: https://github.com/Basicprogrammer10/minecraft-mods/blob/075f7843dddde8e4e37fe5305d1746d50ae21140/fast-doll/src/main/java/com/connorcode/fastdoll/mixin/InventoryScreenMixin.java
