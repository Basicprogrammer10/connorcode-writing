@Title = Creating a Calculator
@Author = Connor Slade
@Date = 12-05-22
@Description = Tokenizing, parsing, and evaluating mathematical expressions
@Tags = connorcode, rust, calculator, math, programming
@Path = programming/creating-a-calculator
@Assets = .

---

# Creating a Calculator

_is the default calculator for your operating system just to convenient?_
Well then I have some good news for you, because I have created the next step in human evolution, a calculator that is so advanced that it can do math!

<div ad note>
TLDR

I made a calculator in Rust. It's on Github [here][github-link].

</div>

## The Backstory

This all started because of [amplify][amplify] which was a programming challenge I made last year ([read more][amplify-info]).
One of the problems was to solve long mathematical expressions like `13*1-84+(94*7*19+2)`.
Now I should have already solved this, as I had written the code that makes the test cases but - I kinda cheated on that.

I was running out of time while finishing amplify before my arbitrary deadline so I just generated a bunch of random mathematical expressions and then solved them with a calculator.
So when the problem went live I just picked python for the solution and used the `eval()` function.

Now 6 months later I was resolving all the problems from scratch to avoid doing school work.
I finished all the problems, but this one: `Less Simple Math`.
I knew I had to start with a tokenizer then parse that into a [Binary expression tree][binary-expression-tree] and then evaluate that.
But how exactly to make the expression tree?
I didn't know.

## Tokenizing

The first step was to take the mathematical expression and turn it into a list of tokens.
The token definitions I ended up using are as follows.

```rust
#[derive(Debug, Clone)]
enum Token {
    Number(i32),
    Op(Ops),
    Group(Vec<Token>),

    // *this will be used later*
    Tree(Ops, Box<Token>, Box<Token>),
}

#[derive(Debug, Clone, Copy)]
enum Ops {
    Add,
    Sub,
    Mul,
}
```

So the first thing to do is loop through all the characters in the expression string.
Now using a match statement we can make a bunch of checks:

- If the character is a '(', we set the `in_group` flag to true.
- If the character is ')' we add a `Group` token to the list of tokens with the contents of recursively calling `tokenize` with the contents of `working`.
- If we are in a group we just add the character to a `working` string.
- If the character is one of the supported operators we add the `Op` token to the output list.
- And finally if the character is a number we also add it to the `working` string.

At the end of all of this we return the list of tokens.

<details>
<summary><strong>Example</strong> (click)</summary>
<br>

```
Input: 13*1-84+(94*7*19+2)
Output: [
    Number(13),
    Op(Mul),
    Number(1),
    Op(Sub),
    Number(84),
    Op(Add),
    Group([
        Number(94),
        Op(Mul),
        Number(7),
        Op(Mul),
        Number(19),
        Op(Add),
        Number(2),
    ]),
]
```

</details>
<br>

## Making the Expression Tree

The tokenizing was the easy part!
(i have written way too many tokenizers in my life)

This part is hard because it has to handle order of operations where multaplacation / division takes priority over addition / subtraction.
For this part after thinking a _tiny bit_ I came up with a solution that is not the best but _works fine_.

We first get the highest operator priority in the list of tokens.
Then loop through the tokens to find the first operator with that priority.
Then we make a `Tree` token with the operator and the two tokens before and after it, these tokens are also removed.
Just keep doing this until there is only one token.

<details>
<summary><strong>Example</strong> (click)</summary>
<br>

```
Input: 13*1-84+(94*7*19+2)
Output: Tree(
    Add,
    Tree(
        Sub,
        Tree(
            Mul,
            Number(13),
            Number(1)
        ),
        Number(84)
    ),
    Tree(
        Add,
        Tree(
            Mul,
            Tree(
                Mul,
                Number(94),
                Number(7)
            ),
            Number(19)
        ),
        Number(2)
    )
)
```

</details>
<br>

## Evaluating

Now onto the final step, evaluating the expression tree.
This part is very easy, we just get the tree node and then recursively call `evaluate` on the left and right nodes.
Then we just do the operation on the left and right nodes and return the result.
The code is so short I will just show it here:

```rust
fn evaluate(tree: Token) -> i32 {
    match tree {
        Token::Tree(op, left, right) => {
            let left = evaluate(*left);
            let right = evaluate(*right);
            match op {
                Ops::Add => left + right,
                Ops::Sub => left - right,
                Ops::Mul => left * right,
            }
        }
        Token::Number(n) => n,
        _ => panic!("Invalid token"),
    }
}
```

Now all I have to do it print the result and I solve the problem and learn a new thing!
You can see the final code for amplify [here][final-amplify-code].

## Calculator

But I told you I made a new calculator to replace all that came before it.
After completing the problem, that night I was thinking about making it into a CLI calculator.
So that's what I did.

## New Features

First off, I added an operator for Division and Exponents.
These were really easy, just a few new lines of code each.

Then I added a nice REPL:

<pre><code> ▷ 5*(4+-1)
 ⮩ 15
 ▷ <span blink>▌</span>
</code></pre>

<script>
const blinker = document.querySelector('span[blink]');
let blink = true;

setInterval(() => {
    blinker.style.opacity = blink ? 0 : 1;
    blink = !blink;
}, 500);
</script>

Then I added support for variables.
Well more constants, because you couldn't change them.
By default, it has a few constants like `pi` and `e`.
I added variable assignment later.

I also added support for functions, which are kinda just variables with groups next to them.
They can be used like this `5 + sin(pi)`.
I then proceeded to go a bit crazy and added ~60 functions including trig functions, logic, conditions, and other math stuff.

## Conclusion

It may or may not have been four months since the last post.
I've been busy and haven't _completed_ anything cool, there is a lot of stuff in the works so you can _look forward to that_.

<!-- LINKS -->

[github-link]: https://github.com/Basicprogrammer10/calc
[amplify]: amplify.connorcode.com
[amplify-info]: https://connorcode.com/writing/programming/amplify
[binary-expression-tree]: https://en.wikipedia.org/wiki/Binary_expression_tree
[final-amplify-code]: https://paste.connorcode.com/b/7318fea4-6106-4edc-99fa-d96d515f2133
