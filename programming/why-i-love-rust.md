@Title = Why I Love Rust
@Author = Connor Slade
@Date = 01-18-21
@Description = Why I Love the Rust Programming Language and where it needs Improvement
@Tags = Programming, Software Development, Rust, Rust Lang, Ferris
@Path = programming/why-i-love-rust
@Assets = .

---

# 🦀 Why I Love Rust

On the [2021 Stack Overflow Survey](https://insights.stackoverflow.com/survey/2021) Rust is the **most loved** language.
This is the 6th year rust had been voted most loved. People definitely love Rust, but why?
In this article I will explain why **I** like rust, and at the end I will touch on some improvements it needs.

![Stack Overflow 2021 Most Loved](../assets/programming/why-i-love-rust/StackoverflowLoved.png)

## ✨ Why It's Great

To me rust feels like a mix of the best parts from `C++`, `JavaScript` and `Python`.
Here I will show some amazing parts of rust!

### 🚄 Speed

First off lets touch on the speed of the language.
It is a compiled language, so it gets similar speed to the C family of languages.
According to tests at [The Benchmarks Game](https://benchmarksgame-team.pages.debian.net/benchmarksgame/fastest/rust-clang.html) Rust often out preformed `C Clang` a or was very close.

Here are the first three tests

![Benchmark Games](../assets/programming/why-i-love-rust/BenchmarksGames.png)

### ✨ Error Handling ✨

This may be my favorite part of rust! Rust has a very different and elegant error handling philosophy.

In most languages errors must be caught in ugly try/catch blocks. In rust there is no trying!
Instead of crashing rust panics, panicking terminates the program immediately providing a message to the caller.
But panic should be used when a program reaches an unrecoverable state. The rest of the time you should use `Options` and `Results`.

You can use `Result<Sucess, Failure>` as a return type from a function.
Within the function you will either return `OK(Sucess)` or `Err(Failure)`.

When you don't want an error type you can use a `Option`.
With options, you will either return `None` or `Some(Sucess)`.

Example Time! If you want to play with the example check it out on the [Plaground](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=3d92bd4da853496ff2ac32a16c335325).

```rust
// Parse the Key Value data and make make sure it returned a sucessfull
// ["Hello", "World"]
assert_eq!(parse_key_value("Hello = World"), Some(["Hello", "World"]));

// Try to parse Invalid Key Value Data
// Make sure None is returned
assert_eq!(parse_key_value("Hello World"), None);

fn parse_key_value(inp: &str) -> Option<[&str; 2]> {
    // Try to split input by '=', split_once itself returns an option
    // so if it is `None` the `?` operator will pass it through
    // But if everything is good it will unwap the Option
    let parts = inp.split_once('=')?;

    // Get and Trim the Key
    let a = parts.0.trim();

    // Get and Trim the Value
    let b = parts.1.trim();

    // Return a Sucessfull Value
    Some([a, b])
}
```

If you are sure it was successful you can `.unwrap()` the option.
Calling unwrap on a None it will panic the thread.

If you just want to run some code if it was successful you can use an `if let` statement.

```rust
// Make a new Option
let a = Some("Darren");

// If a is a Some run the code with i being the upwraped value
if let Some(i) = a {
  println!("Hello {i}");
}
```

Now a quick Result Example, also on the [Plaground](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=b288e50546a71fed4a01179b90747a28).
This is just like the previous example but just will Results.
In this case a Result is overkill but if a function could have multiple different errors this is the bettor solution.

```rust
assert_eq!(parse_key_value("Hello = World"), Ok(["Hello", "World"]));

assert_eq!(parse_key_value("Hello World"), Err(KeyValueError::SplitError));

// Type to return on error
#[derive(Debug, Eq, PartialEq)]
enum KeyValueError {
    SplitError,
}

fn parse_key_value(inp: &str) -> Result<[&str; 2], KeyValueError> {
    let parts = match inp.split_once('=') {
        Some(i) => i,
        None => return Err(KeyValueError::SplitError)
    };

    let a = parts.0.trim();
    let b = parts.1.trim();

    Ok([a, b])
}
```

### 📖 Documentation

Rust has great Documentation in two ways.

The **first way** is Actual Documentation, when you are getting started with rust there is [The Rust Book](https://doc.rust-lang.org/stable/book/).
It teaches the important concepts of rust, going from printing `"Hello World"` to making a webserver.
The [Standard Library](https://doc.rust-lang.org/std/) is also very well documented with clear information and lots of examples.

The **second way** is with [Rust Doc](https://doc.rust-lang.org/rustdoc/index.html), which is a program to generate Documentation pages from Doc comments on Functions, Structs, Enums, etc.
These doc comments support Markdown, including Code Blocks that are actually tested like unit tests.

> Its job is to generate documentation for Rust projects.
> On a fundamental level, Rustdoc takes as an argument either a crate root or a Markdown file, and produces HTML, CSS, and JavaScript.
>
> — [The Rust Doc Documentation](https://doc.rust-lang.org/rustdoc/index.html)

For example if I have the following function:

````rust
/// Used to Greet Someone
///
/// ## Example
/// ```rust
/// greet("Darren");
/// ```
pub fn greet(name: &str) {
  println!("Hello {name}!");
}
````

I can build and open the docs with this command

```bash
cargo doc --open
```

Here we can see the final output of the documentation

![Cargo Doc Example](../assets/programming/why-i-love-rust/CargoDoc.png)

### 📦 Cargo

This is a big one!

> Cargo is the Rust package manager.
> Cargo downloads your Rust package's dependencies, compiles your packages, makes distributable packages, and uploads them to crates.io, the Rust community’s package registry.
>
> — [Cargo Documentation](https://doc.rust-lang.org/cargo/)

Basically it makes creating, building, running, testing, documenting and benchmarking easier.
So you can use Cargo to easily use other libraries with your programs.
But Cargo is much more…

Cargo can make use of other programs like [Rust FMT](https://github.com/rust-lang/rustfmt) for code formatting and
[Rust Clippy](https://github.com/rust-lang/rust-clippy) for catching common mistakes in your code.
You can even add your own sub commands to Cargo.

#### 🧁 Rust FMT

Let's say we have the following code to normalize an HTTP path (from [afire](https://github.com/Basicprogrammer10/afire)).
(_yes,,, i had to make this messy lol_)

```rust
fn normalize_path(mut path:String) -> String {
  if path.ends_with ( '/' )
  {      path.pop();
  }

      if !path.starts_with('/') {
            path.insert(0, '/');

      }

    path
      }
```

By running Rust FMT (`cargo fmt`) our messy code will be made into the following

```rust
fn normalize_path(mut path: String) -> String {
    if path.ends_with('/') {
        path.pop();
    }

    if !path.starts_with('/') {
        path.insert(0, '/');
    }

    path
}
```

You can see how It fixed the indentation, spacing, and extra new lines.
As great is it is we sometimes want to keep specific formatting, for that you can use `#[rustfmt::skip]` attribute.
Personally I have my text editor format the file on save.

#### ✂ Cargo Clippy

[Clippy](https://github.com/rust-lang/rust-clippy) has over 500 [lints](https://rust-lang.github.io/rust-clippy/master/index.html) to catch common mistakes and improve your Rust code.

Like before lets look at an example. I tried to cram a lot of problems into this :P.
At first glance it may look like it works, when running it does give a correct looking response for the circumference.

```rust
let mut e = 3.14;
let mut pi = 2.71;

// Swap `e` and `pi`
pi = e;
e = pi;

// Calculate circumference
let circumference = 2.0 * pi * 10.0;

// Print Results
println!("PI: {pi}");
println!("E: {e}");
println!("Circumference: {circumference}");

assert!(true)
```

Let's now run Rust Clippy (`cargo clippy`).

```text
warning: value assigned to `pi` is never read
 --> src/main.rs:3:13
  |
3 |     let mut pi = 2.71;
  |             ^^
  |
  = note: `#[warn(unused_assignments)]` on by default
  = help: maybe it is overwritten before being read?

error: this looks like you are trying to swap `pi` and `e`
 --> src/main.rs:5:5
  |
5 | /     pi = e;
6 | |     e = pi;
  | |__________^ help: try: `std::mem::swap(&mut pi, &mut e)`
  |
  = note: `#[deny(clippy::almost_swapped)]` on by default
  = note: or maybe you should use `std::mem::replace`?
  = help: for further information visit https://rust-lang.github.io/rust-clippy/master/index.html#almost_swapped

error: approximate value of `f{32, 64}::consts::PI` found
 --> src/main.rs:2:17
  |
2 |     let mut e = 3.14;
  |                 ^^^^
  |
  = note: `#[deny(clippy::approx_constant)]` on by default
  = help: consider using the constant directly
  = help: for further information visit https://rust-lang.github.io/rust-clippy/master/index.html#approx_constant

warning: `assert!(true)` will be optimized out by the compiler
  --> src/main.rs:14:5
   |
14 |     assert!(true)
   |     ^^^^^^^^^^^^^
   |
   = note: `#[warn(clippy::assertions_on_constants)]` on by default
   = help: remove it
   = help: for further information visit https://rust-lang.github.io/rust-clippy/master/index.html#assertions_on_constants

warning: `playground` (bin "playground") generated 2 warnings
error: could not compile `playground` due to 2 previous errors; 2 warnings emitted
```

Ok,,, you gotta admit it's a little impressive to put that many issues in so little code.
Anyway it not only shows what the issue is, but it will often show how to fix it.
Using these errors and suggestions our code becomes the following.

```rust
let mut e = std::f32::consts::PI;
let mut pi = std::f32::consts::E;

std::mem::swap(&mut pi, &mut e);

let circumference = 2.0 * pi * 10.0;

println!("PI: {pi}");
println!("E: {e}");
println!("Circumference: {circumference}");
```

This is a rather extreme example, but especially when starting in rust this tool is incredibly useful.
Even now I will occasionally make a mistake that I wouldn't have even noticed without Clippy.

### 📜 Rust Analyzer

[rust-analyzer](https://rust-analyzer.github.io/) is a library for semantic analysis of Rust code.
It can be used to let IDEs and Text Editors get information on rust projects, it can being the following features to your editor.

- Syntax Highlighting
- Code Completion
- Annotations
- Macro Expansion
- Find All References
- Go to Definition
- Inlay Type Hints
- Error _Squiggles_
- _More_

In this screenshot you can see how my text Editor ([atom](https://atom.io/)) is showing autocomplete options with rust-analyzer.

![Rust Language Server In Atom](../assets/programming/why-i-love-rust/rls.png)

This is less of a language feature, but it makes the development process much easier because of the features mentions above and the ability for it to highlight errors right in your code.

### 🐡 TurboFish

This is a smaller feature bit frequently comes in handy.
TurboFish as it is typically called is a way of passing a type to a function that returns a Generic.
It is needed when the compiler cant infer the type.
It is much cleaner than having to assign the value to a variable with an explicit type if you are going to use it again after.

Here is an example that gets the amount of even numbers in a Vector

```rust
let x = vec![1, 2, 3, 4, 5, 6, 7, 8];
let y = x.iter().filter(|x| *x % 2 == 0).collect().len();

assert_eq!(y, 4);
```

When trying to compile this we get this error

```text
error[E0282]: type annotations needed
 --> src/main.rs:3:46
  |
  |     let y = x.iter().filter(|x| *x % 2 == 0).collect().len();
  |                                              ^^^^^^^ cannot infer type for type parameter `B` declared on the associated function `collect`
  |
  = note: type must be known at this point
```

If we were to add the type `usize` to the variable definition this would not help, as the type is needed before then.
To fix this we could remove the `.len()` and add the type `Vec<_>` to the variable `y` and redefine it later, but this is messy.
With turbo fish this can be fixed by changing line `2` to the following

```rust
let y = x.iter().filter(|x| *x % 2 == 0).collect::<Vec<_>>().len();
```

The underscore tells the compiler to infer the type. In this case it just needed to know that we were collecting into a Vector.
Now it compiles and runs perfectly. _Cool Beans_!
Check it out on the playground [here](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=c2a1c22ebfb8287e251312760decdf01).

### <img src="../assets/programming/why-i-love-rust/ferris-party.svg" alt="Party Ferris" width="25px"></img> Ferris

As this is the final positive point in this article it's the **most important**.

Rust has one of the **_Cutest_** mascots of any programming language.
Meet Ferris the Crab, unofficial mascot for Rust.
![Ferris the Crab](../assets/programming/why-i-love-rust/ferris.svg)

Head to [rustacean.net](https://www.rustacean.net/) for more Ferris!

## 🧊 Ways to Improve

## 🚧 Conclusion

## 🟠 To-do

Positives

- 🟢 Speed
- 🟢 _✨ Error Handling ✨_
- 🔴 Error Messages
- 🟢 Documentation
- 🔴 Comprehensive STD
- 🔴 Ownership
- 🟡 Cargo Tools
  - 🟢 Cargo Doc
  - 🟢 Cargo FMT
  - 🟢 Cargo Clippy
  - 🔴 Cargo Test
- 🔴 Crates.io
- 🟢 rust-analyzer
- 🟢 TurboFish
- 🟢 Cute Mascot

Negatives

- 🔴 Slower Compile Times
- 🔴 Annoying Safe Multithreading
- 🔴 Young Library Ecosystem
- 🔴 Learning Curve?
