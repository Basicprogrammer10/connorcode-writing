@Title = Radio Data
@Author = Connor Slade
@Date = 04-02-23
@Description = Transferring binary data over radio waves
@Tags = radio, data
@Path = programming/radio-data
@Assets = .
@Hidden = true

---

<style>
    [title] {
        text-decoration: underline;
    }
</style>

# Radio Data

> Transferring binary data over radio waves

<div ad info>
Info

This project was made my just me for a hackathon, so it is not totally complete.
Last year I made an [Oscilloscope Renderer](/writing/programming/oscilloscope-renderer).

</div>

## Principle

For transferring data I ended up using <span title="dual tone multi frequency">DTMF</span> tones.
These are the same tones that are used for phone dialing.
The frequencies were chosen because they aren't multiples of any others, making digital decoding more reliable.

|        | 1209 Hz | 1336 Hz | 1477 Hz | 1633 Hz |
| :----: | :-----: | :-----: | :-----: | :-----: |
| 697 Hz |    1    |    2    |    3    |    A    |
| 770 Hz |    4    |    5    |    6    |    B    |
| 852 Hz |    7    |    8    |    9    |    C    |
| 941 Hz |   \*    |    0    |    #    |    D    |

Because there are 16 available tones, 4 bits can be encoded in each <span title="">symbol</span>.
