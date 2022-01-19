@Title = Programming
@Author = Connor Slade
@Date = 01-18-21
@Description = Programming related Articles
@Tags = Programming, Software Development, Web Development, Development
@Path = programming/why-i-love-rust
@Assets = .

---

# 🦀 Why I Love Rust

On the [2021 Stack Overflow Survey](https://insights.stackoverflow.com/survey/2021) Rust is the **most loved** language.
This is the 6th year rust had been voted most loved. People definitely love Rust, but why?
In this article I will explain why **I** like rust, and at the end I will touch on some improvements it needs.

![Stack Overflow 2021 Most Loved](../assets/programming/why-i-love-rust/StackoverflowLoved.png)

## ✨ Why It's Great

Here I will show some amazing parts of rust!

### 🚄 Speed

First off lets touch on the speed of the language.
It is a compiled language, so it gets similar speed to the C family of languages.
According to tests at [The Benchmarks Game](https://benchmarksgame-team.pages.debian.net/benchmarksgame/fastest/rust-clang.html) Rust often out preformed `C Clang` a or was very close.

Here are the first three tests

![Benchmark Games](../assets/programming/why-i-love-rust/BenchmarksGames.png)

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

## 🐡 TurboFish

This is a smaller feature bit ofen comes in handy.
TurboFish as it is often called is a way of passing a type to a function that returns a Gerneric.
It is needed when the compiler cant infer the type.
It is much cleaner than haveing to to assign the value to a varable with an explicit type if you are going to use it again after.

Here is an example

```rust
let x = vec![2, 4, 6, 8];
let y = x.iter().map(|x| x * 2).collect().len();

assert_eq!(y, 4);
```

When trying to compile this we get this error

```
error[E0282]: type annotations needed
 --> src/main.rs:4:37
  |
  |     let y = x.iter().map(|x| x * 2).collect().len();
  |                                     ^^^^^^^ cannot infer type for type parameter `B` declared on the associated function `collect`
  |
  = note: type must be known at this point
```

This can be fixed by changeing line `2` to the following

```rust
let y = x.iter().map(|x| x * 2).collect::<Vec<_>>().len();
```

## 🧊 Ways to Improve

## 🚧 Conclusion

## 🟠 TODO

Positives

- TurboFish
- Cargo Tools
  - Cargo Doc
  - Cargo FMT
  - Cargo Clippy
  - Cargo Test
- Error Messages
- _✨ Error Handling ✨_
- Comprehensive STD
- Ownership
- Cute Mascot
- Crates.io

Negatives

- Slower Compile Times
- Annoying Safe Multithreading
- Young Library Ecosystem
- Learning Curve?
