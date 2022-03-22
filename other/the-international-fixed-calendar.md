@Title = The International Fixed Calendar
@Author = Connor Slade
@Date = 03-21-22
@Description = My thoughts on our current calendar system and the international fixed calendar
@Tags = Calendar, International Fixed Calendar
@Path = other/the-international-fixed-calendar
@Assets = .

---

# 📅 The International Fixed Calendar

The International Fixed Calendar system as it became known was a calendar reform designed by Moses Cotsworth.
It was first presented in 1902.
Sadly it was never adopted in any country, although the Kodak Company used it internally from 1928 to 1989.

The calendar has 13 months each with four seven-day weeks, making it consistently 28 days per month.
This only makes 364 days, so at the end of the year an extra day is added to the weekend making it 365 days.
The extra month added to the year is named Sol, and it's put between June and July.

## 🪀 A Month on the Calendar

Here is what each month on the International Fixed Calendar looks like.
This same pattern is used for all 13 months.

Today is <span date>XXXX</span> on the International Fixed Calendar.

| Sun | Mon | Tue | Wed | Thu | Fri | Sat |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|  1  |  2  |  3  |  4  |  5  |  6  |  7  |
|  8  |  9  | 10  | 11  | 12  | 13  | 14  |
| 15  | 16  | 17  | 18  | 19  | 20  | 21  |
| 22  | 23  | 24  | 25  | 26  | 27  | 28  |

## 🦝 Rant

From the creation of the calendar that the Gregorian calendar was (indirectly) based off of over a thousand years ago the days per month were inconsistent.
It went beck and forth between 29 and 30 and as changes to this system were made days were shifted around more, and we eventually got to the mess that we now call a calendar.
Like who thought that was a good idea??

The Gregorian calendar was also designed around the idea of christen holidays, It's kinda odd how so many time-related things are christen influenced.
Like this calender system that we still use and the year numbering itself.
I mean not that many but two is still a lot,,, anyway.

This reform would make things so much more consistent, systems like this existed in many ancient cultures and worked _spectacularly_.
I think that removing the religious aspect from the systems we all use is something we should work for.
There are lots of different religions people have as well as people who don't have any, and I think that it's really fair for one group's religions beliefs to be forced on everyone.
Sadly I don't think It will catch on any time soon, but that's not going to stop me!

## ✨ My changes

I think this system is cool and I wanna use it!
So from now on I will be using the International Fixed Calendar system and number dates as years since 1970 (It works for epoch time :p).
For my public stuff I will still use _normal_ dates as to not confuse people with articles released in the year 52.

## 🎓 Conclusion

So that was a nice short little arcile!
Hopefully you learned somthing new.
If you want to learn more about the International Fixed Calendar system check it out on wikipedia [here][ifc-wiki].

Happy Tuesday, March 24th, 52.

<script>
  const months = ["January", "February", "March", "April", "May", "June", "Sol", "July", "August", "September", "October", "November", "December"];

  let now = new Date();
  let year = new Date(now.getFullYear(), 0, 0);
  var day = Math.floor((now - year) / 86400000);

  let ifcMonthIndex = Math.floor(day / 28);
  let ifcDay = day - ifcMonthIndex * 28;

  document.querySelector("[date]").innerHTML = `<code>${months[ifcMonthIndex]} ${ifcDay}</code>`;
</script>

[ifc-wiki]: https://en.wikipedia.org/wiki/International_Fixed_Calendar
