@Title = Video to Ascii
@Author = Connor Slade
@Date = 03-13-22
@Description = Converting video into Ascii
@Tags = Programming, Ascii, Video to Ascii
@Path = programming/video-to-ascii
@Assets = .

---

# 🎹 Video to Ascii

so i wanted to make a video into text,,, as we all do...
Here in this article I will outline how I did it.

<div ad note>
Note

This is all on GitHub [here][github].

</div>

## 🌏 Planning

Its that time again!!!
The first idea I had was to convert each image to grayscale then scale down the image to be console size.
The greyscale values could be interpolated from 0-255 to 0-9 in order to pick a character for the pixel.
For the pixel characters here is that I came up with:

```
....................
,,,,,,,,,,,,,,,,,,,,
++++++++++++++++++++
^^^^^^^^^^^^^^^^^^^^
oooooooooooooooooooo
********************
&&&&&&&&&&&&&&&&&&&&
00000000000000000000
####################
@@@@@@@@@@@@@@@@@@@@
```

I also thought that this would be a good time for [dithering][dithering].

## 🦔 Programming

### Image Preprocessing

First step was to open and scale the image.
For this task I made use of the [image crate][image-crate].
Here is the little bit of code for that.

```rust
let img = image::open(i.path()).unwrap();
let img = img
    .resize(100, 100, imageops::FilterType::Triangle)
    .into_rgb8();
```

### Image Conversion

The next thing to do was to convert the image into a grayscale pixel array.
This function I made takes in the image and returns a value from 0 to 1.
0 is black and 1 is white and everything in between is a gray of some sort.

```rust
fn im_load(img: RgbImage) -> Vec<Vec<f32>> {
    let mut image = Vec::new();
    let dim = img.dimensions();

    // Loop through Image Pixels
    for y in 0..dim.1 {
        let mut v = Vec::new();
        for x in 0..dim.0 {
            // Get pixel valye
            let px = img.get_pixel(x, y).0;

            // Convert to grayscale
            let px = px[0] as u16 + px[1] as u16 + px[2] as u16;

            // Convert to percentage (0-1)
            let per = (px / 3) as f32 / 255.0;

            v.push(per);
        }
        image.push(v);
    }
    image
}
```

### ASCIIfication

Now onto the _most importent_ part of this system.
Turning the image into text!
This function builds a string by picking the best charector.
The diffrence from the best charector to the acutal value is then passed off to surrounding pixels with dithering.

```rust
const IMG_CHARS: [char; 10] = ['.', ',', '+', '^', 'o', '*', '&', '0', '#', '@'];

fn asciify(mut image: Vec<Vec<f32>>) -> String {
    let dim = (image[0].len(), image.len());

    let mut out = String::new();
    for y in 0..dim.1 as usize {
        for x in 0..dim.0 as usize {
            // Get pixel value (0-1)
            let mut px = image[y][x];
            if px > 1.0 {
                px = 1.0;
            }

            // Convert pixel value (0-1) to a char index (0-9)
            let index = (px * (IMG_CHARS.len() - 1) as f32).floor();
            let chr = IMG_CHARS[index as usize];

            // Get error
            let err = px - index / IMG_CHARS.len() as f32;

            // Apply error (Floyd–Steinberg dithering)
            if x > 1 && x < dim.1 as usize - 1 && y < dim.1 as usize - 1 {
                image[y + 0][x + 1] = image[y + 0][x + 1] + err * 7.0 / 16.0;
                image[y + 1][x - 1] = image[y + 1][x - 1] + err * 3.0 / 16.0;
                image[y + 1][x + 0] = image[y + 1][x + 0] + err * 5.0 / 16.0;
                image[y + 1][x + 1] = image[y + 1][x + 1] + err * 1.0 / 16.0;
            }

            // Add char to line
            // Added twice to maintain aspect ratio
            out.push(chr);
            out.push(chr);
        }
        out.push('\n');
    }

    out
}
```

## Showcase

<pre>
  <div class="show">
    Loading...
  </div>
</pre>

<script>
let e = document.querySelector(".show");

fetch("/writing/assets/programming/video-to-ascii/sayso.txt")
    .then((d) => d.text())
    .then((d) => {
        let frames = d.replace(/\r/g, "").split('\n\n');
        let frame = 0;

        setInterval(() => {
          e.innerText = frames[frame % frames.length];
          frame++;
        }, 67);
    });
</script>

[github]: https://github.com/Basicprogrammer10/ascii-video
[dithering]: https://en.wikipedia.org/wiki/Dither
[image-crate]: https://crates.io/crates/image
