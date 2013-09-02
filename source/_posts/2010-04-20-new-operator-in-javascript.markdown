---
layout: post
title: '"new" Operator in JavaScript'
date: 2010-04-20 09:10
comments: false
categories: JavaScript
---

In JavaScript, there’s an operator called ```new``` which we use to create an instance of an object (i.e Constructor function). So, what does **new** do? Well, it ensures that you always get an object when you use it with a constructor function. By the way, there’s no difference between a constructor function and a normal function, both are same. The term constructor function is used to indicate that we can create an object of that type using the **new** operator. 
<!--more-->

Consider the following example:

{% codeblock lang:javascript %}
function Foo() {
    this.name = 'Foo';
}
var foo = new Foo();
foo.name // => Foo
{% endcodeblock %}

The above code pretty much says that you first create an instance of the constructor function (note the upper case first letter, it is a convention not a rule ) using ```new``` operator, once that statement executes you now have an object as the value of ```foo``` and in the next line it simply prints the “_name”_ property of that object, which in this case is an instance variable of the constructor function "Foo".

Take a look at the example below and guess what would be the value of ```foo```:
     
{% codeblock lang:javascript %}
function Foo() {
     this.name = 'Foo';
     return 'Foo';
}
var foo = new Foo();
foo.name // => Foo
{% endcodeblock %}

Interesting thing is that in this case the value of ```foo``` is still an object, but we did return a String, so why the hell ```foo``` contains an object? Well, the purpose of the **new** keyword is to ensure that you always get an object, so anything other than object is discarded, if you return an object then that will be used else a new object is created and returned. Now if we replace our return statement using this code ```return { prop: 'Foo' };``` then the value of ```foo``` will have a different value altogether and accessing ```foo.name``` will result in ```undefined```.

Interestingly, if you return ```null``` then that will be NOT be used, even though you might think that _null_ is an object and ```typeof(null) === 'object' ```, so it should use that. In fact, it does not, it appears that **new** returns only objects which can evaluate to truthy value.

The last but not the least, if you return a **function** other than object then the function will be used. Why? Because functions are objects too, only difference is that they are special objects, that’s why there’s a separation between objects and functions, the ```typeof``` operator handles that properly, but in this case it appears that the **new** doesn't really care about that.