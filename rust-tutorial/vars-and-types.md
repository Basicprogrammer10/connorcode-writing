@Title = Rust Tutorial
@Author = Connor Slade
@Date = 07-08-22
@Description =
@Tags =
@Path = rust-tutorial
@Assets = .
@Hidden=true

---

<link rel="stylesheet" href="../assets/rust-tutorial/style.css" />

# Rust Tutorial &mdash; Variables and Types

## Variables

Creating a variable in rust is done with the `let` keyword.
By default the variable is immutable, meaning you can not update or change it, to make it mutable you must use `let mut`

```rust
// Define and initialize `a`
let a = 10;
a += 1; // Compile Error

let mut a = 10;
a += 1;
```

<div ad note>
Note

In some languages, using the same name for a variable in the same scope is not allowed.
This is not the case in rust, that is why in the above example `a` is redefined with another instance of the `let` keyword.

</div>

## Intro to Types

In the above example, when we create a variable without an explicit type, the Rust compiler will try to figure out what type it must be.
If you want to use a specific data type you can
