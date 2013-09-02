---
layout: post
title: "Danger of Using Same Password Everywhere"
date: 2012-09-01 23:23
comments: false
categories: Security, Password
---

It has been said many times before by a lot of great people from the world of Computer Security and I am going to say it again, yes again, even though you don't like it!

> <big>Do not use same password everywhere</big>

Why not? No one can guess my password, it's ultra-strong, it contains letters, digits and even some special characters, I have even tested it with [Password Strength Meter](http://www.passwordmeter.com/), so it's simply unbreakable :-).

Indeed your password is unbreakable and even unguessable but there is a very good chance that you'll lay it bare without even knowing it. Surprised right? Want to know how is this possible? Keep reading, I am going to tell you about the possibilities.
<!--more-->

These days we spend a considerable amount of time on the Internet looking for useful stuff that we would like to use. Most of these websites require signing up to the service in order to use it, during that process it also asks you to create an "username/password" and also your email id so that they can communicate with you. The problem lies right there in the process when you create an "username" and "password". If you are a person who mostly uses same password everywhere, then you are at risk without even realizing it. 

So what is the risk? The risk is, you don't know whether the site that you are signing up is actually **storing your password in plain text** or not. Logically, the website should **encrypt** your password before storing it in the database, but not all websites do that. There aren't many ways that you can discover whether they are storing it in plain text or in encrypted form. But, there is a way and that is if you receive a confirmation email from that site where they have mentioned your username and password then it clearly is an indication that they are storing it in **plain text** - remember one thing **a one-way encrypted password cannot be converted back to plain text** (theoretically and the cost of decrypting is much higher), so it is technically impossible for that website to send you your password in plain text form. The other option is to try out the "Forget Password" facility and see if they are sending you your old password in plain text to retrieve your account. 

You may ask why storing password in plain text is wrong ? It is wrong because **nothing in this world is completely secure**. If that site is ever compromised and the attacker gets hold of the database then he will have a list of users with their usernames, emails and passwords ( in plain text ), the damage is not limited to that website only, it is much bigger than you can even think of. Let's imagine that you are an attacker and you have successfully compromised "example.com" which stores the user detail (password) in plain text, now you have a list of users with their email ids and the passwords that they have used while signing up to "example.com", now if you try to log in to the users' email accounts using the password you have on that list for each email ids, you'll see that at least 20-30% of users or even more have the same password. See the pattern? There is a Domino effect once you lose access to your email account, you'll lose access to your Facebook, Twitter and probably other services for example Bank accounts.

Here is a list of things that you can follow to minimize the damage as much as possible:

* Don't be an idiot, the safety of your valuable data should be extremely important to you. It is not necessary to jump right into the fray the moment you receive an invite email from your friend about a cool new site. If you really want to try out the site then create a fake account first ( you can create fake email ids at [Mailinator](http://www.mailinator.com) ).
* Use separate password for each of your important email/social network accounts. There are some password generators that you can use e.g. **1Password**
* See if that site is offering other ways of authentication without sharing/giving your email id or password, for example OpenID and OAuth. Nowadays Facebook, Twitter, Google and Yahoo all provide OAuth/OpenID authentication service for third-party websites.
* Search in your inbox to see if you have received any email earlier from a website where they had sent you your username and password in plain text, if you find one then try deleting that account if not possible then see whether the password matches with any of your email ids, if it does then change your password immediately.

I know even all the steps mentioned above are not 100% foolproof, but at least if you are aware of the fact then it will surely help you minimize the risk. This is more like a "Social Engineering" problem, if you can understand this then take necessary steps to prevent it as much as possible.

## For websites developers
The safety and security of users' data is extremely important, it is always a good practice ( rather a must-have practice ) to encrypt sensitive user data. Storing passwords in plain text is utterly irresponsible and disrespectful act to the users. Also make sure that passwords are filtered out from your server's log files. A little bit common sense can help protect the Internet as well as users.

> Here is a webcomic from XKCD on password reuse - <http://xkcd.com/792/>
