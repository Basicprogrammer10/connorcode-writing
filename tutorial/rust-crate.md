@Title = Tutorial: Rust Crate
@Author = Connor Slade
@Date = 01-12-22
@Description = Learn how to create, test, package, document and publish a rust crate
@Tags = Rust, Rust Crate, Make a rust crate
@Path = tutorial/rust-crate
@Assets = .

---

# 📦 Tutorial: Rust Crate

So, you want to learn how to make a rust crate (library)? Well you came to the right place!

This Tutorial Requires you to have [Rust and Cargo](https://rustup.rs) installed as well as some basic [Rust knowledge](https://doc.rust-lang.org/stable/book/).
You will learn how to make a crate, add unit tests, documentation and finally publish to [crates.io](https://crates.io).

### 📐 Setting Up

The first thing you need to do is create the Cargo project!
You can do that by running the following command.
This will make a new Cargo Library project.

```bash
cargo new --lib <PROJECT_NAME>
```

Now cd into the `<PROJECT_NAME>` directory and launch your favorite text editor :P

### 📦️ The Package

Open the `Cargo.toml` file, here we will configure the values `description` and `license`.
These values are needed to publish on crates.io.

For this example I will use [`GPL 3`](https://www.gnu.org/licenses/gpl-3.0.en.html) for the license and `Example Crate` for the description.

The `Cargo.toml` should now look something like this

```toml
[package]
name = "example_crate"
version = "0.1.0"
edition = "2021"
license = "GPL-3.0"
description = "Example Crate"
```

### 🌵 The Code

Now time to do some programming! _yay_

In this example I will make a _very_ simple function to greet someone.
You will be able to input for example `"Darren"` and it will output `"Hello, Darren!"`.

Here is the code I will use for my `src/lib.rs`

```rust
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
```

### 🧪 Testing

So, we have the code, but we want to make sure everything is working before we publish it.
To do this we will use _Unit Texting_! In this super simple example is not important
but when you make bigger projects it becomes more difficult to make sure everything is working.

_any who_

Here is the unit test I will use. It has two test cases for `"Darren"` and `"Brenda"`.

```rust
// Only build this code if testing
#[cfg(test)]
mod tests {
  // Include the functions in the module tests is defined in
  // This gives the tests access to all public functions in our example
  use super::*;

  // Define the tests
  #[test]
  fn test_greet_darren() {
    assert_eq!(greet("Darren"), "Hello, Darren!")
  }

  #[test]
  fn test_greet_brenda() {
    assert_eq!(greet("Brenda"), "Hello, Brenda!")
  }
}
```

Now running `cargo test` should give us 2 passed tests!

### 📄 Documentation

One crucial part to any good library is good documentation. Rust makes this super easy with [Rustdoc](https://doc.rust-lang.org/rustdoc/what-is-rustdoc.html).
All you have to do is add a description and _optional_ example.
Then you can automagically generate a documentation page for your crate.

To add documentation to a function, struct, enum, or anything you use three slashes (`///`) then some text in Markdown format.
You can add as many lines of this as you want. Code blocks in the doc string will be run as _doc tests_ when running `cargo test`

So let's add those docs! This will be the greet function now.

````rust
/// Greet someone by their name
///
/// Will prepend "Hello, "
/// and append "!" to the name
/// ## Example
/// ```rust
/// assert_eq!(greet("Darren"), "Hello, Darren!")
/// ```
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
````

### 🦀 Lets try it!

Now that we have our _amazing_ crate, we should try it out!
To do this I like to use examples.

First make a new folder named `examples` in the crate root (Folder with `Cargo.toml`).
Inside this folder make a `test.rs` file. Add a main function and include the crate with `use <PROJECT_NAME>::<function>`.

My example the test.rs file now has the following code

```rust
use example_crate::greet;

fn main() {
    println!("{}", greet("Darren"));
}
```

To run this file use `cargo run --example test` and If everything is working we can move on to publishing the crate!

### 📢 Publishing

First go to [crates.io](https://crates.io) and login with GitHub. Then go to [https://crates.io/settings/tokens](https://crates.io/settings/tokens) and create a new token. Now run this command to save the token `cargo login <TOKEN>`.

To publish the package just use `cargo publish`. Yay, you now have made a rust crate, tested it, added documentation and published it on crates.io.
