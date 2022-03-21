@Title = Minecraft Discord Interface
@Author = Connor Slade
@Date = 03-20-22
@Description = How I made a Discord Minecraft interface in rust
@Tags = Discord Minecraft Interface, Discord Bot, Minecraft, Rust, Programming
@Path = programming/minecraft-discord-interface
@Assets = .

---

# 🐳 Minecraft Discord Interface

In this article, I will explain how I made and how to use my new Minecraft discord interface.
It's written in rust, is easily extendable and lets you show information on discord from the Minecraft server as well as interact with the server over discord.
Source code can be found [here][source-code] on GitHub.

## 🥁 Why

_y?_
That's a good question, I already made something very similar to this ~10 months ago ([Minecraft-Server-AutoRestart][mcs-source]).
Despite the name, it also sends messages on discord with events like server starts, stops, chat messages, player joins, etc.
This system was webhook based, so it could only send messaged to discord and not receive them.

I decided to make this because on the [404 Technical Minecraft Server][404_tmc] the admin is making a Discord bot to interface with the Minecraft server and had a fantastic idea.

> Only concern I have with logging to a channel is clutter
>
> Not sure about the feasibility but I think **having a widget showing who’s online and not would be cleaner**

I don't know of any Minecraft Discord interface bots that do this.
So _for once_ I could possibly, just maybe make something kinda useful.
And that's what I did!

## 🍫 Planning

imma be honest,,, i didn't really do too much planning on this one.
I already figured out a lot of how I would get this system working with my original interface thing.
It used stdout regexes to define when events would be trigger.

The only really new thing with this system was that it is a full on bot and not just a webhook.
This means it also needed a command system to let you interact with it over discord.
But I already knew how I wanted this part to work after developing [NoseBot][nose-bot].

I wanted to have these commands and events defined in structs implementing an Event trait or something to keep it all clean.
So with the basic idea out of the way, let get to the implementation.

## 🎪 _Implementation_

It's Implementation time!

_what do you mean thats not a real thing??_

### Server Interface

So the first thing I did was get the server communication working.
This process starts with reading the config file into the Config struct.
This config stored the path for the java executable, the folder the Minecraft server was in, the bot token, etc.
It then starts the process and pipes its stdin and stdout, this is what is uses to interface with the serve.

This approach has some benefits, but of course it also has many drawbacks.
Some pros include working regardless of server version, and working with vanilla or heavily modded servers.
The cons include having worse interface with the internals of the server.

Anyway, moving onto the code.
Here is the section of the code where the process is spawned.
It uses mpsc channels to communicate between threads.

```rust
// Start server
let mut server = process::Command::new(config.minecraft.java_path)
    .args(config.minecraft.start_cmd.split(' ').collect::<Vec<&str>>())
    .stdout(Stdio::piped())
    .stdin(Stdio::piped())
    .spawn()
    .expect("Error starting process");

// Get std(in / out)
let raw_stdout = server.stdout.as_mut().unwrap();
let stdout = BufReader::new(raw_stdout).lines();
let mut stdin = server.stdin.take();

// Spawn a new thread to interact with server stdin
thread::spawn(move || {
  let stdin = stdin.as_mut().unwrap();

  // Wait for incomming server events
  for i in server_rx.iter() {
      // Execute commands in the event
      for j in i {
          stdin
              .write_all(j.as_bytes())
              .expect("Error writing to stdout");
          stdin.flush().unwrap();
      }
  }
});

// Loop though stdout stream
for i in stdout.map(|x| x.unwrap()) {
    // Pass through stdout
    println!("[$] {}", i);

    // Trigger Events if regex matches
    events.iter().for_each(|e| {
        if let Some(j) = e.0.captures(&i) {
            // Run code for event
            let exe = e.1.execute(&i, j);

            // Send server response
            server_tx
                .send(exe.server)
                .expect("Error sending event to server");

            // Send discord respons
            discord_tx
                .send(exe.discord)
                .expect("Error sending event to discord thread");
        }
    })
}
```

The different built-in events were mostly taken from my old system.
No need to reinvent the reinvented wheel!
They all implement the Event trait that requires them to have a name, chat regex and execution function.
For an example, here is the event for chat messages, this one is really short.

```rust
pub struct ChatMessage;

impl Event for ChatMessage {
    // Define event name
    fn name(&self) -> &'static str {
        "chat_message"
    }

    // Define regex that determines if when this event will run
    fn regex(&self) -> &'static str {
        r"\[.*\]: <(.*)> (.*)"
    }

    // Define the code to execute the the event is called
    fn execute(&self, _line: &str, regex: Captures) -> Response {
        // Get some info from the regex match
        let name = regex.get(1).unwrap().as_str();
        let message = regex.get(2).unwrap().as_str();

        // Print a message and send a discord log event
        println!("[🎹] `{}` said `{}`", name, message);
        Response::new().discord_text(format!(":speech_left: **{}** » {}", name, message))
    }
}
```

### Discord Interface

This was the hardest and most annoying part of this project (excluding not understanding Atomic type memory orders).
The library I picked was [serenity][serenity], although this wasn't really a choice, as there went really any other decent options I knew of.
I considered writing my own system, but a quick look at the discord docs made me dismiss the idea very quickly.

The problem with serenity is that it is async, this is usually a good thing, but reading from the server stdout is very much a sync task.
I'm also not too into async, but I am _hating it less_ after this project.

What I ended up with was a sync main function that then spawn an async thread with [tokio][tokio] and then communicated between the threads over a mpsc channel.
The next thing to do was get the DiscordEvents system working so on like a player join event, the discord thread would be notified and then send a message.
This system took place in the serenity `cache_ready` event, where it would wait for incoming Discord events and send messages and update embeds.

In this part of the system is where I had the main issue, and it was with the whole waiting for an event in an async context.
It was really annoying because it wasn't just not working it was sometimes working fine, and sometimes doing nothing.
This blocking operation was clearly keeping any other tasks from being completed and this stumped me for a while.
I had no idea that to do, but the next morning I decided to read through all the tokio docs and I learned a lot about rust async, but then I found it, `yield_now`.

This function _yields_ execution back to the runtime allowing it to poll other tasks.
Putting this one little function at the end of the loop completely fixed this (_somehow_).
After fixing this, it was really just smooth sailing adding features.

And we haven't event talked about the command system yet!
Ya know I will put that in its own section, this one is getting _very_ long.

### Discord Command System

This is not too crazy but so far this system only goes from Minecraft to Discord, we need to handle commands to interface the other way too!
This part of the system listens for all messages, and if it starts with the right prefix it tries to find and run the command.
If no commands with specified name are found it used the Dice coefficient to suggest similar spelled real commands.

Here is the trait defecation for Command.
The name is what the command matcher uses to see if this command should be used.
Help and description are used by the help command to well,,, give help on a command.
needs_server defines if the commands needs the Minecraft server to be running before it can be used.
And finally at no surprise to anyone, the execute function defines what to do then the command is called.

```rust
pub trait Command {
    fn name(&self) -> &'static str;
    fn help(&self) -> &'static str;
    fn description(&self) -> &'static str;
    fn needs_server(&self) -> bool {
        false
    }
    async fn execute(&self, cfg: &Config, ctx: Context, msg: Message) -> Response;
}
```

Commands are then defined as structs implementing Command.
Here is the implementation for the refresh command.
This commands forces the data widget to _refresh_.

```rust
pub struct Refresh;

#[async_trait]
impl Command for Refresh {
    fn name(&self) -> &'static str {
        "refresh"
    }

    fn help(&self) -> &'static str {
        "refresh"
    }

    fn description(&self) -> &'static str {
        "Refreshes data embed"
    }

    async fn execute(&self, _cfg: &Config, ctx: Context, msg: Message) -> Response {
        // Add a nice reaction to the message to show it was handled
        msg.react(ctx, ReactionType::Unicode("✅".to_owned()))
            .await
            .unwrap();

        // Send a discord event to refresh the data embed
        Response::new().discord_refresh_data()
    }
}
```

So thats about it for the implamentation.

## 🛸 Usage

This part will outline how to use this _spectacular_ system.
First step is to git clone `https://github.com/Basicprogrammer10/minecraft-discord-interface.git` or [download as zip][download-zip] if you're feeling abit quirky.

Then once inside the dir make sure cargo is installed (if not install it [here][rustup]) then build with `cargo b --release`.
Now get a discord bot token, if you don't know how to check [this article][discord-token].
When you invite the bot make sure to give it a perms code of `274877926400`.

Make and put your Minecraft server in the `server` subdir then modify the `config.cfg` file to have the right bot token.
You will also need to change the `mc_java_path` to the java.exe file for your java installation and change `mc_start_cmd` to run the correct server.jar file.

Last step is to make 2 new channels in your discord server you are using the bot in, I would name then something like `minecraft-data` and `minecraft-events`.
Then right click copy the ID of each channel and put it in the correct config entry (bot_data_channel and bot_event_channel).

If everything worked running `.\target\release\minecraft_discord.exe` (removing the exe if you arent on windows) in a terminal emulator should start your server and update the channels you specified before.

## 🎬 Showcase

<video src="../assets/programming/minecraft-discord-interface/DiscordInterface.mp4" controls></video>

## 🐈 Conclusion

So this whole project came together like really fast lol.
I think it's a nice improvement to my old system and as always I learned something new.
What more could you ask for in a project? (*alot,,, but just ignore that*)

[source-code]: https://github.com/Basicprogrammer10/minecraft-discord-interface
[mcs-source]: https://github.com/Basicprogrammer10/Minecraft-Server-AutoRestart
[404_tmc]: https://discord.gg/eBJbuNcGkH
[nose-bot]: https://github.com/Basicprogrammer10/NoseBot
[serenity]: https://crates.io/crates/serenity
[tokio]: https://crates.io/crates/tokio
[download-zip]: https://github.com/Basicprogrammer10/minecraft-discord-interface/archive/refs/heads/master.zip
[rustup]: https://rustup.rs/
[discord-token]: https://www.writebots.com/discord-bot-token/
