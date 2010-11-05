dojo-templateApp
================

dojo-templateApp provides a starting-point for a dojo-based application, with a flexible, modular structure. 
The tapp.Application class takes care of bootstrapping the application and components, and acts as a controller for page-level concerns.

Motivation
----------

There's a threshold you cross when a page-with-some-stuff-on-it becomes an application. Its not a hard line, but you know you've crossed it when you find yourself needing to share common objects, allow components on the page to controlled and informed by other changes on the page, when you need to control how a page sets up, and handle errors at an application or page level.

This is one implementation that has been born out of writing strikingly similar code again and again on various apps. As a project, the end-goal here is not to arrive at something that fits everyone's idea of what a dojo app should look like, but to start with something that works and which implements patterns from the get-go that have been found useful in non-trivial projects.

Status
------

Much of this code or the ideas it implements have been in use in various projects for some time. What's new are:

* the implementation of the Component/Plugin model into Application
* The lifecyle phases and method sequence implementation
* The implementation of the UI as a component of the Application, and the change this implies to how/when it is instantiated

I fully expect this to continue to evolve. 

Usage
-----

See the tests/test_ApplicationUI.html page for an example of how the pieces can fit together. 

TODO
----

* More docs
* Error reporting
* Further field testing
* Data handling examples


