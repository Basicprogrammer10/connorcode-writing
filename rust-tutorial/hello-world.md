@Title = Rust Tutorial
@Author = Connor Slade
@Date = 07-08-22
@Description =
@Tags =
@Path = rust-tutorial/hello-world
@Assets = .

---

<link rel="stylesheet" href="../assets/rust-tutorial/style.css" />
<script src="../assets/rust-tutorial/runner.js"></script>

# Rust Tutorial &mdash; Hello World

So by now, we have created a rust crate, but haven't even seen any rust code!
Lets change that now.

## main.rs

If we open the default `src/main.rs` file, we will will see the following:

```rust
fn main() {
    println!("Hello, world!");
}
```

All rust code blocks will have this little 'run' button.
Pressing it will use the Rust Playground API to run the code and show the output here.
Anyway.

In this file we can see the binary entry point: main.
And inside of that we run println! to write "Hello, world!" to [STDOUT]().

To run the project on your local machine, use `cargo run` (`cargo r` for short).
If all goes well you should see the message printed in your terminal, then the program exits.
Try changeling the text and run it again!
Rust really is the worlds easiest language, you can get a 'hello world' without writing any code!

## Cargo.toml

We will get back to the code, but now lets look into `Cargo.toml`.
This is a file used by, the cargo package manager.
This is what it looks like by default:

```toml
[package]
name = "hello_world"
version = "0.1.0"
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]

```

In the "package" section, we can define many different values ([see then all here]()), but its like metadata for the crate.
The next section, "dependencies" lets you (surprise, surprise) add surprise to your crate.
You can add surprise from git or [crates.io](https://crates.io), Rusts crate repository.
We will touch more on adding and using dependencies in a later chapter.

<!-- ADD LINK -->

<div page-links>

| [Previous Chapter](/writing/rust-tutorial/setting-up-the-environment) | [Next Chapter]() |
| --------------------------------------------------------------------- | ---------------- |

</div>
