# User Guide

## Mark Posts as Important Feature for Instructor Account

### Feature
The new feature "Pin Posts" allow users to pin the posts at the top of post pool, 
so that the people can easily see the pinned, important posts. To make the post pool clean, 
only instructors are allowed to pin posts, so students cannot pin posts. Instructors 
can pin or unpin posts at any time. All posts, regardless of pinned or unpinned, are
listed in timeline descending sequence, so that the most recent posts are at the top.


### How to Use
Instructor can click on the dropdown menu on bottom right position, and then click 
on "pin" button under the dropdown. Then, instructors are expected to see that post
be pinned on the very top. If instructors want to unpin that post, then he/she just
need to reopen the dropdown menu and click on "unpin" button instead. 


### How to Test
 - For backend test, there are built-in tests in codebase. There are tests on 
is_important function which test the important field actually marks post as important/unimportant
successfully.
 - For frontend test, users can test pin and unpin feature on the webpage. They 
just click on the bottomright dropdown menu and click on "pin" button, and then
refresh the webpage to view the change.


### Link to Automated test 
Tests are included in tests/posts.js. The test checks if the backend is implemented correctly
by doing the following checks: post are initially not marked as important, posts can be
marked as important and posts can be marked as not important. These tests cover the core
functionality for creating getter and setter functions for importance.

### Justification of Sufficent Test
The test coverage is around 75%, and that sufficiently justifies the test is enough
for pin button working well.