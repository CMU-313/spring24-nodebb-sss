prompt: 
In this file, provide a detailed outline of how to use and user test your new feature(s)
You should also provide a link/description of where your added automated tests can be found, along with a description of what is being tested and why you believe the tests are sufficient for covering the changes that you have made.

1. New Feature Introduction: Pin Posts
The new feature "Pin Posts" allow users to pin the posts at the top of post pool, 
so that the people can easily see the pinned, important posts. To make the post pool clean, 
only instructors are allowed to pin posts, so students cannot pin posts. Instructors 
can pin or unpin posts at any time. All posts, regardless of pinned or unpinned, are
listed in timeline descending sequence, so that the most recent posts are at the top.


2. How to use pin feature:
Instructor can click on the dropdown menu on bottom right position, and then click 
on "pin" button under the dropdown. Then, instructors are expected to see that post
be pinned on the very top. If instructors want to unpin that post, then he/she just
need to reopen the dropdown menu and click on "unpin" button instead. 


3. How to test pin feature
(a). For backend test, there are built-in tests in codebase. There are tests on 
is_important function which test the important field actually marks post as important/unimportant
successfully.
(b). For frontend test, users can test pin and unpin feature on the webpage. They 
just click on the bottomright dropdown menu and click on "pin" button, and then
refresh the webpage to view the change.


4. Link to Automated test 
Tests are included in tests/posts.js


5. Justification of sufficent test
The test coverage is around 75%, and that sufficiently justifies the test is enough
for pin button working well.