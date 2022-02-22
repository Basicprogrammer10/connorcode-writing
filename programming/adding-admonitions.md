@Title = Adding Admonitions
@Author = Connor Slade
@Date = 02-21-21
@Description = How I added markdown admonitions to my website
@Tags = Markdown, Admonitions, Markdown Rendering, Markdown Extension
@Path = programming/adding-admonitions
@Assets = .

---

<style>
  .colors > .color{
    width: 20px;
    height: 25px;
    border-radius: 4px;
    display: inline-block;
    margin-right: 5px;
    border-left: solid 5px;
  }
</style>

# 🧀 Adding Markdown Admonitions

So first off, what are these '_admonitions_'?
Admonitions are a way to add little notes, warnings, or tips to your text.

<div ad info>
Info

Admonitions look like this!

</div>

They aren't part of normal Markdown, but there are extensions to add support for them in things like [docusaurus][ad-docusaurus] and [mkdocs][ad-mkdocs].
I thought It would be cool to add these into my website,,, so that's what I did.

## 🍁 The Plan

At this point, I wasn't really sure where to start with this, or even what these things were called.
I remembered seeing some in AsciiDoc, so I checked the documentation there.
This is where I learned that they are called admonitions.

Searching the term `Markdown Admonitions` lead to the docusaurus and mkdocs pages linked above.
I then had a general idea of what I wanted. I selected 5 admonitions wanted to have.

- Info
- Tip
- Note
- Warning
- Caution

Now to figure out _how_ to do it.

My website uses [comrak][comrak] as the markdown renderer.
Comrak supports for modifying the HTML renderer process, but It's a bit complicated;
This is why I decided to stay away from all that and instead decided to implement it in all CSS.

## 📀 The Implementation

This is the markdown / HTML for one of my admonitions:

```html
<div ad info>
  Title

  Content
</div>
```

I started by selecting the `[ad]` attribute and making the background red and rounding the corners (by 4px).
Then to add the little [FontAwesome][fontawesome] icon, I set the content of `[ad]:before` to be the icon code (Ex: <i class="fa fa-info-circle"></i> `\f05a`).
I also set the font to be `normal normal normal 14px/1 FontAwesome;`, which is usually automatically set by the FontAwesome's `fa` class.

At this point, I needed to find some colors for all the admonitions.
So I did some searching and eventually decided to steal these colors from the [Microsoft docs][microsoft-docs]:

<div class="colors">
  <div class="color" style="background:#00417380;border-color:#004173;"></div>
  <div class="color" style="background:#054b1680;border-color:#054b16;"></div>
  <div class="color" style="background:#3b2e5880;border-color:#3b2e58;"></div>
  <div class="color" style="background:#6a4b1680;border-color:#6a4b16;"></div>
  <div class="color" style="background:#63000180;border-color:#630001;"></div>
</div>

The only 'problem' was that I was repeating a lot of CSS for each color.
So I looked into SCSS [Mixins][scss-mixins]. These let you define reusable CSS code and then call upon it with parameters.

This is the SCSS I ended up with. See it in context on GitHub [here][final-code-context].

```scss
@mixin admonition($name, $color, $char) {
  & [#{$name}] {
    background: rgba($color, 0.5);
    border-left: solid 5px $color;

    &:before {
      content: $char;
    }
  }
}

.document {
  /* skip */

  & .content {
    /* skip */

    & [ad] {
      margin: 16px 0 16px 0;
      border-radius: 4px;
      padding: 10px;

      &:before {
        font: normal normal normal 14px/1 FontAwesome;
        font-size: inherit;
      }

      & p {
        margin: 10px 0 0 0;
      }
    }

    @include admonition(info, #004173, "\f05a");
    @include admonition(tip, #054b16, "\f0eb");
    @include admonition(note, #3b2e58, "\f249");
    @include admonition(warn, #6a4b16, "\f071");
    @include admonition(caution, #630001, "\f00d");
  }
}
```

## 🐌 Showcase

I've talked so much about them, now let's see them all!

<div ad info>
Info
</div>

<div ad tip>
Tip
</div>

<div ad note>
Note
</div>

<div ad warn>
Warning
</div>

<div ad caution>
Caution
</div>

## ✨ Conclusion

I think this was a nice little _CSS adventure_. I learned about SCSS mixins, which I had never used before.
Getting a delightful end result and adding another feature to my site is great too :p

In this article, I also tried to add some little visuals (In [## The Implamentation](#-the-implementation)) to show the colors I picked.
This is something I will definitely try to do more in the future.

[ad-docusaurus]: https://docusaurus.io/docs/markdown-features/admonitions
[ad-mkdocs]: https://squidfunk.github.io/mkdocs-material/reference/admonitions/
[comrak]: https://crates.io/crates/comrak
[final-code-context]: https://github.com/Basicprogrammer10/connorcode/blob/27371806fb4c215a8d8fe53e2a9b126eb12f71a4/data/web/scss/writing.scss#L178
[fontawesome]: https://fontawesome.com/v4/icons/
[microsoft-docs]: https://docs.microsoft.com/en-us/contribute/markdown-reference
[scss-mixins]: https://sass-lang.com/documentation/at-rules/mixin
