@Title = Fast Doll
@Author = Connor Slade
@Date = 03-20-23
@Description = Rendering the inventory player modal at full speed
@Tags = Minecraft
@Path = minecraft/fast-doll
@Assets = .

---

# Fast Doll

A while ago, I was trying to add a bedrock like player model to my Minecraft Utility Mod, [SigmaUtils][sigma-utils].
While doing this, I found that the inventory player model was only updating every tick, causing it to look choppy.
Now, five months later I finally fixed it, and released a mod so _the world_ can finally play minecraft the way it was meant to be played.

<div ad info>
Mod Info

Downloads:

- [Modrinth][modrinth] (preferred)
- [CurseForge][curse-forge]
- [GitHub][source] (source)

</div>

## Why this Happens

<div ad note>
Note

I will be using [Yarn Mappings][yarn] for the class, field, variable, and method names in this post.

</div>

So you might be wondering why this is happening in the first place.
To explain that, we will first need to see how Minecraft renders normally renders entities.
In the `MinecraftClient`'s main `render` function, a boolean is passed that determines if the game should tick or not.
If this boolean is true, then we call the client's tick method, otherwise we are between ticks, and we should just render the game.

The problem with this is that movement of entities would look choppy if their positions and rotations were only updated per tick.
Mojang's solution was to create a `tickDelta`, which is the percentage of the way between ticks.
Using this value, the positions, rotations, and animations of entities can be linearly interpolated between ticks.
This makes the game look much smoother.

You might be able to see where this is going.
For some reason, when rendering the inventory player model, the tick delta is not passed through, but just set to 1.0.
This causes the model to only update 20 times a second, which looks very choppy.
_So choppy in fact_, that nobody has cared to make a bug report or mod to fix it. (That I know of)
In reality this is not a big deal but it would be nice if it was fixed.

## How I Fixed it

I first tried to fix this problem when I first saw it 5 months ago, but for some reason I didn't get it to work.
But now, after solving the issue, I saw that its actually a surprisingly simple fix.
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

As you can clearly see, the tick delta is always being set to 1.0.
Fixing this should just be easy enough, right?
I started by just adding in the tick delta from `client.renderTickCounter.tickDelta` where client is the `MinecraftClient` instance.
Unfortunately, this didn't really work, it made the model wiggle around a lot.

<video controls src="../assets/minecraft/fast-doll/jitter-bug.mp4" width="50%"></video>

To do the interpolation between ticks, entities (extending `Entity`) have various 'previous' fields for x, y, z, yaw, pitch, and horizontal speed (Some classes inheriting from Entity have more previous fields).
These fields are updated every tick, and are used between ticks to smoothly render the entity.
The issue I faced here occurred because the previous fields were still set to the player's actual position and rotation, while the current fields were set to the normalized position and rotation.
I suspect that Mojang originally set the tick delta to 1.0 to just ignore these previous fields.
Once I figured this out, fixing it was as easy as setting the previous yaws and pitches to the current ones, then setting them back after rendering:

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
So that's why I made a small standalone mod that just adds this fix.
The mod has the mixin shown above and a super simple config screen that I might add some more options to in the future.
Download links [here](#fast-doll).

Here is a video of the mod in action.
The video starts with the mod enabled, and its disabled about halfway through.
You can see the choppy movement most clearly on the player's legs.

<video controls src="../assets/minecraft/fast-doll/showcase.mp4"></video>

## Conclusion

So far, the mod has gotten many downloads on Modrinth and CurseForge:

- <img src="https://img.shields.io/modrinth/dt/OjbSENEi" alt="Modrinth Downloads" style="border-radius: 0;" />
- <img src="https://cf.way2muchnoise.eu/fast-doll.svg" alt="CurseForge Downloads" style="border-radius: 0;" /> (slow to update)

I also submitted [a bug report][bug-report] to Mojang, so we will see if they fix it in the future.
Be sure to vote for it if you want it fixed.

<!-- LINKS -->

[sigma-utils]: https://github.com/Basicprogrammer10/SigmaUtils
[modrinth]: https://modrinth.com/mod/fast-doll
[curse-forge]: https://www.curseforge.com/minecraft/mc-mods/fast-doll
[source]: https://github.com/Basicprogrammer10/minecraft-mods/tree/master/fast-doll
[yarn]: https://github.com/FabricMC/yarn
[mixin]: https://github.com/SpongePowered/Mixin
[full-mixin]: https://github.com/Basicprogrammer10/minecraft-mods/blob/075f7843dddde8e4e37fe5305d1746d50ae21140/fast-doll/src/main/java/com/connorcode/fastdoll/mixin/InventoryScreenMixin.java
[bug-report]: https://bugs.mojang.com/browse/MC-261134
