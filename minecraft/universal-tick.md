@Title = Universal Tick
@Author = Connor Slade
@Date = 07-14-22
@Description = Slowing down the game
@Tags = Minecraft
@Path = minecraft/universal-tick
@Assets = .

---

# 🧵 Universal Tick

_gotta go sllooowwww_

<div ad info>
Info

Fabric mod source code on GitHub [here](https://github.com/Basicprogrammer10/UniversalTick)

</div>

## 🧊 The idea

A Minecraft fabric mod that lets you change the tick speed of servers and clients.

There are some other mods that do this including [TRC-No-Lag](https://github.com/Wartori54/TRC-No-Lag) but it doesn't slow all aspects of the game on the client.
This means that (for example) even when setting different tick speeds the enchant glints still runs normally.
The goal of this project is to make a new tick rate changer that doesn't have these little problems.

### Commands

Here are the commands that it will have:

| Command | Example                               | Description                                                                                                    | Op  |
| ------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --- |
| set     | `/tick set <TPS> (clients \| server)` | Sets the tick rate of the server, clients or both                                                              | ✅  |
| get     | `/tick get`                           | Returns the target tick speed and the server's actual tick speed (`SERVER_TARGET CLIENT_TARGET ⌂ SERVER_REAL`) |     |
| config  | `/tick config <SETTING> <VALUE>`      | Sets some config values                                                                                        | ✅  |

### Config

And here are the settings that can be set with the config command:

| Setting     | Default Value | Description                                                       |
| ----------- | ------------- | ----------------------------------------------------------------- |
| clientMouse | true          | Weather the client tick rate will affect mouse sensitivity        |
| clientSound | true          | Weather the client tick rate will affect the sound playback speed |

## 🚧 How it works

Now onto the code!

### Commands

On server startup we register the tick command with a blob of code setting permission requirements and argument suggester.
Below is a code snippet that defines the tick set command.
For the execution of the command ([code here](https://github.com/Basicprogrammer10/UniversalTick/blob/84e77fb19b3752b9663e2082a7e3b79e0d5c032b/src/main/java/com/connorcode/universaltick/commands/TickSet.java)) we parse the TPS / percentage and whether we are changing the tick rate of the server, client or both.

<div ad note>
Note

**TPS**: Ticks per second (`MSPT / 1000`)
**MSPT**: Milliseconds per tick (`1000 / TPS`)

</div>

If we are changing the tick rate of the clients, we broadcast a `universialtick.tickspeed` packet with the target MSPT.

```java
/* SNIP */
dispatcher.register(
    CommandManager.literal("tick")
        .then(CommandManager.literal("set").requires((x) -> x.hasPermissionLevel(4))
            .then(CommandManager.argument("tick", string())
                .suggests((c, b) -> suggestMatching(new String[]{"20.0", "100p"}, b))
                .executes(tickSetCommand::execute)
                .then(CommandManager.argument("type", string()).suggests(
                        (c, b) -> suggestMatching(
                            new String[]{"server", "clients", "universal"}, b))
                    .executes(tickSetCommand::execute)))
            .executes(ctx -> easyErr(ctx, "No tick rate provided")))
/* SNIP */
```

The other commands are slimier, they just parse some arguments and send some packets.

### Server

So now onto modifying the TPS of the server.
This really couldnt be easier, we just need a simple Mixin on the `MinecraftServer` that changes the MSPT value from 50 to whatever the user has set.

```java
@Mixin(MinecraftServer.class)
public class TickTime {
    @ModifyConstant(method = "runServer", constant = @Constant(longValue = 50L))
    long modifyTickTime(long tickTime) { return UniversalTick.targetMSPT; }
}
```

### Client

On the client things get abit,,, difficult.
fortunately setting the basic tick speed is just as easy with the server:

```java
((ClientRenderTickCounter) ((ClientTickEvent) MinecraftClient.getInstance()).renderTickCounter()).tickTime(mspt);
```

#### Sound

In order to slow down the sounds in game we can just adjust the pitch with a Mixin!
This code adjusts the pitch by the percent speed the game is running at.
So if it were running at 10 TPS (100 MSPT) it would multiply the sound pitch by 50% (50 / 100).

```java
@Mixin(SoundSystem.class)
public class ClientSoundSystem {
    @Inject(method = "getAdjustedPitch", at = @At("HEAD"), cancellable = true)
    void modifyPitch(SoundInstance instance, CallbackInfoReturnable<Float> returnable) {
        if (!UniversalTickClient.settings.clientSound) return;
        returnable.setReturnValue(50.0F / UniversalTickClient.clientTickSpeed);
    }
}
```

#### Enchant

Now on to the speed of the Item glint animation.
This one is easy to set but It took a long time for me to figure out how to do it.

Just like with the sound it takes the original value and changes it

```java
@Mixin(RenderPhase.class)
public class ClientRenderItem {
    @Redirect(method = "setupGlintTexturing", at = @At(value = "INVOKE", target = "Lnet/minecraft/util/Util;getMeasuringTimeMs()J"))
    private static long getEnchantmentTime() { return (long) (Util.getMeasuringTimeMs() / (UniversalTickClient.clientTickSpeed / 50.0)); }
}
```

#### Input handling

Now the part that is actually hard.
Minecraft only checks inputs every tick, which is fine if the game is running at 20TPS.
But if it's not then you get input lag; at 0.1TPS you can get up to 2 seconds of delay before some inputs are processed.

Because of this I made it update inputs every frame, which removed the input lag but added some other issues.
When you would try to break a block the client would break it too fast.
So in the end I fixed it by making it so when the client updates a block's break percent it sets a cooldown of the client's target MSPT before it will handle an input again.

Here is the code that handles the events if the cooldown has expired:

```java
@Mixin(MinecraftClient.class)
public abstract class ClientMixin {

    /* SNIP */

    @Inject(method = "render", at = @At(value = "INVOKE", target = "Lnet/minecraft/client/Mouse;updateMouse()V"))
    private void checkInputs(boolean tick, CallbackInfo ci) {
        if (currentScreen != null || Util.getEpochTimeMs() - UniversalTickClient.lastBlockHitTimestamp < UniversalTickClient.clientTickSpeed)
            return;
        this.handleInputEvents();
        this.gameRenderer.updateTargetedEntity(1.0F);
    }

    /* SNIP */
}
```

## 🎭 See it in action

Here is a video of me just playing around abit :p.
My poor git repo is not going to like holding another long video lol.

<video src="../assets/minecraft/universal-tick/video.mp4" controls></video>

## 🙀 Conclusion

Well I spent <img src="https://wakatime.com/badge/user/172d7c74-6872-40e7-9e7a-8365ac707ca1/project/95c60917-2a1e-49db-9654-3a2ee0ce99a9.svg" style="transform: translateY(-10%);border-radius: 0"> on this project so,,, thats um _cool_.
As always I learned a lot about Minecraft, Fabric Modding and Mixins.
Thats all.

> Have a nice day
>
> \- Connor
