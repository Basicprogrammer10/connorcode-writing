@Title = Universal Tick
@Author = Connor Slade
@Date = 07-14-22
@Description = Slowing down the game
@Tags = Minecraft
@Path = minecraft/universal-tick
@Assets = .

---

# 🧵 Universal Tick

_gotta go slow_

<div ad info>
Info

Fabric mod source code on github [here](https://github.com/Basicprogrammer10/UniversalTick)

</div>

## The idea

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

## How it works

Now onto the code!

### Commands

On server startup we register the tick command with a blob of code setting permision requirements and argument sugusters.
Below is a code snipit that defines the tick set command.
For the execution on the command ([code here](https://github.com/Basicprogrammer10/UniversalTick/blob/84e77fb19b3752b9663e2082a7e3b79e0d5c032b/src/main/java/com/connorcode/universaltick/commands/TickSet.java)) we parse the tps / percentage and weither we are changeing the tick rate of the server, client or bolth.

<div ad note>
Note

**TPS**: Ticks per second (`MSPT / 1000`)
**MSPT**: Miliseconds per tick (`1000 / TPS`)

</div>

If we are changing the tick rate of the clients, we brodcast a `universialtick.tickspeed` packet with the target MSPT.

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

The other commands are simaler, they just parse some arguments and send some packets.

### Server

So now onto modifyins the TPS of the server.
This really couldent be easyer, we just need a simple Mixin on the `MinecraftServer` that changes the MSPT value from 50 to whatever the user has set.

```java
@Mixin(MinecraftServer.class)
public class TickTime {
    @ModifyConstant(method = "runServer", constant = @Constant(longValue = 50L))
    long modifyTickTime(long tickTime) { return UniversalTick.targetMSPT; }
}
```

### Client

On the client things get abit,,, diffacult.
Forchanally setting the baisc tick speed is just as easy with the server:

```java
((ClientRenderTickCounter) ((ClientTickEvent) MinecraftClient.getInstance()).renderTickCounter()).tickTime(mspt);
```

#### Sound
In order to slow down the sounds in game we can just ajust the pitch with a Mixin!
This code ajusts the pitch by the percent speed the game is running at.
So if it were running at 10 TPS (100 MSPT) it would multaply the sound pitch by 50% (50 / 100).

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

Now on to the speed of the Item glint anamation.
This one is easy to set but It took a long time for me to figure out how to do it.

Just like with the sould it takes the orginal value and changes it 

```java
@Mixin(RenderPhase.class)
public class ClientRenderItem {
    @Redirect(method = "setupGlintTexturing", at = @At(value = "INVOKE", target = "Lnet/minecraft/util/Util;getMeasuringTimeMs()J"))
    private static long getEnchantmentTime() { return (long) (Util.getMeasuringTimeMs() / (UniversalTickClient.clientTickSpeed / 50.0)); }
}
```

#### Input handling

## See it in action

## Conclusion
