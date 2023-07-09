<style>
    [title] {
        text-decoration: underline;
    }
</style>

# Rust Tutorial

When I first started learning [Rust](rust-lang.org) two years ago, I found it much more difficult to learn because of the lack of online resources.
So I have decided to make the tutorial I wish I had when I was learning Rust.
A lot of the other tutorials focus more on the language, but this one takes a wider look into the rust ecosystem, stating with setting up your text editor to learning about popular dependencies.
We start with `n` chapters to learn rust from (that encourage you to try stuff on your own) and finish with some projects.

<div ad note>
Note

##

## This is still a <u>work in progress</u>.

If you have any suggestions or want to report any errors, you can do so on [Github](https://github.com/basicprogrammer10/connorcode-writing).

</div>

## Intro

[Rust](rust-lang.org) is a relatively modern programming language, with its 1.0 release only in 2015.
That being said, its usage has been increasingly dramatically in recent years, with big companies like Microsoft and Google showing interest.
One of rust's biggest features, is its [_Memory Safety_](https://en.wikipedia.org/wiki/Memory_safety), this is a term that is often used when discussing rust, but what exactly is it?

When you need to do hold data in your program, you have to request some from the Operating System. <!--EDIT-->
In languages like C and C++ you can then use a <span title="">pointer</span> to reference that memory, but this leaves room for various bugs, often with security implications.
A both Microsoft and Google Chrome security research has shown that ~70% of security vulnerabilities are caused by memory safety issues.

## Lessons

1. [Setting up the environment](./setting-up-the-enviroment)
2. [Hello World]()
3. [Variables and Types]()
4. [Conditionals and Loops]()
5. [Functions]()
6. [Structs, Enums and Unions]()
7. [Error Handling]()
8. [Iterators]()
9. [Traits]()
10. [Projects]()
    1. [Number Guessing]()
    2. [API Interface (tbd)]()
    3. [CLI hash checker]()
