@Title = Using libmpv in Rust
@Author = Connor Slade
@Date = 07-09-23
@Description =
@Tags =
@Path = programming/using-libmpv-in-rust
@Assets = .

---

# Using libmpv in Rust

<div ad info>
Info

If you are having trouble using `libmpv` with rust on Windows, this article may be helpful.
(Skip to [Linking::Windows](#windows) if you already know how to use `libmpv-rs`)

</div>

I recently finish a project I had been wanting to work on for a long time ([video-presenter](https://github.com/Basicprogrammer10/video-presenter)).
It allows you to define cuepoints on a video and kinda use it like a slideshow, skipping to different cuepoints and waiting before continuing past one.
Anyway, to support a wide selection of video formats, I decided to use [libmpv](https://github.com/mpv-player/mpv/blob/master/DOCS/man/libmpv.rst) ([source](https://github.com/mpv-player/mpv/tree/master/libmpv)).

## The Code

When I searched for "libmpv rust" I found the `mpv` crate, but that is deprecated and the README suggested using [`libmpv-rs`](https://github.com/ParadoxSpiral/libmpv-rs).
Using this crate is fairly easy, here is a simple example to play 'video.mp4'.

Cargo.toml:

```toml
# SNIP #

[dependencies]
libmpv = "2.0.1"
```

main.rs:

```rust
use libmpv::Mpv;

fn main() {
    // Create new MPV context
    let mpv = Mpv::new().unwrap();

    // Play a file
    mpv.playlist_load_files(&[("video.mp4", FileState::AppendPlay, None)]).unwrap();

    // Create an event listener for "playback-time"
    let mut events = self.mpv.create_event_context();
    events
        .observe_property("playback-time", libmpv::Format::Double, 0)
        .unwrap();

    loop {
        // Not sure why the api is like this
        // The timeout is completely arbitrary, but I saw 1000 being used in other projects, so
        let event = match events.wait_event(1000.0) {
            Some(e) => e.unwrap(),
            None => continue,
        };

        match event {
            // Handle the playback-time event
            Event::PropertyChange {
                name: "playback-time",
                change: PropertyData::Double(val),
                ..
            } => {
                println!("{val}s");
            }
            _ => {}
        }
    }
}
```

## Linking

### Linux

Now, if you try to compile this, you may get an error like "mpv.lib not found".
If you are on Linux this could be as simple to fix as installing the libmpv package.
On Ubuntu, you can use `sudo apt install libmpv-dev`.

Trying to run the example again now, should open a window and start playback while printing the time to stdout every few frames.

### Windows

On Windows, this process is a bit more complicated.
First you will need to download the libmpv files (definitions and dll), you can do this from its [Sourceforge page](https://sourceforge.net/projects/mpv-player-windows/files/libmpv).
Because the `libmpv-rs` crate is outdated (requires major version of 1), you will need to make sure you download an older version, like [x86_64-20201220-git-dde0189.7z](https://sourceforge.net/projects/mpv-player-windows/files/libmpv/mpv-dev-x86_64-20201220-git-dde0189.7z/download).

Extracting the 7zip archive will revel the following files:

```text
libmpv.dll.a
mpv-1.dll
mpv.def

include/
    client.h
    opengl_cb.h
    render.h
    render_gl.h
    stream_cb.h
```

You will need to copy the `mpv-1.dll` and `mpv.def` files into a folder in your project, I would suggest something like `lib`.
You now need to generate the required `.lib` file.

<div ad note>
Note

To continue, you will need a Visual Studio installation which supports stdint.h, recent ones do.
In this article, I am using Visual Studio 2019.

</div>

Now go into the lib folder with CMD (PowerShell did not work), and run the following commands:

---

If you are using a different version of Visual Studio, you may need to change this command.

```bash
"C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
```

It sets up the environment for the specified platform, if you aren't on x64, pass one of the supported platforms:

- x86
- x86_amd64
- x86_x64
- x86_arm
- x86_arm64
- amd64
- x64
- amd64_x86
- x64_x86
- amd64_arm
- x64_arm
- amd64_arm64
- x64_arm64

---

Now, before running this command, open `mpv.def` and make sure the first line is `EXPORTS`.
If it is not, add it.

```bash
lib /def:mpv.def /name:mpv-1.dll /out:mpv.lib /MACHINE:X64
```

This command is part of the _Microsoft Library Manager_, and we will be using it to generate the `mpv.lib` file.
Just like before, if file names or the platform in the command are not correct, change them.
If all goes well, you should see `Creating library mpv.lib and object mpv.exp`.

---

Now you just need to let cargo know where to find this lib file.
If you have not already, make a `build.rs` file, then add the following code, being sure to change the path if you chose a name other then lib:

```rust
fn main() {
    println!("cargo:rustc-link-search=lib");
}
```

Running `cargo b` should now work, but running the compiled application probably wont.
To fix that, just copy the `mpv-1.dll` file from lib into the directory of the executable (target/debug or target/release) or put it in your PATH.
Now you should be able to run your application!
Just remember to also ship this DLL if you are publishing your program.

## Conclusion

Hopefully this was able to help someone.
I was easily able to get my [video-presenter](https://github.com/Basicprogrammer10/video-presenter) program to work on Linux, but had a lot of trouble compiling and running it on Windows.
