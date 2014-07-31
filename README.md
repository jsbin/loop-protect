# loop-protect

JS Bin's loop protection implementation.

This code protects most cases where user code includes an infinite loop using a `while`, `for` or `do` loop.

Note that this does *not* solve the [halting problem](http://en.wikipedia.org/wiki/Halting_problem) but simply rewrites JavaScript (without an AST) wrapping loops with a conditional break. This also *does not* protect against recursive loops.

## Example

With loop protection in place, it means that a user can enter the code as follows on JS Bin, and the final `console.log` will still work.

```js
while (true) {
  doSomething();
}

console.log('All finished');
```

## Usage

The loop protection can be used both on the client side and server side. It supports AMD and CommonJS module loading, or can be included as vanilla JavaScript (as it is in JS Bin).


### Public methods

- loopProtect.hit (callback)
- loopProtect.debug (method)
- loopProtect.alias (string): used if loopProtect is aliased to a different variable

### Example implementation

```js
// Get some arbitrary JavaScript code that *may* have an infinite loop
var js = getUserCode();

// we're going to alias the loopProtect object under a different name
// when it runs inside the iframe, so we need to configure the loopProtect
// *before* we process the JavaScript.
loopProtect.alias = 'protect';

var processed = loopProtect(js);

// run in an iframe, and expose the loopProtect variable under a new name
var iframe = getNewFrame();

iframe.contentWindow.protect = loopProtect;

```

## Abstract

The loop protection method takes a string of JavaScript and manually parses the code manually to find `while`, `for` and `do` loops.

Once these loops are found, a *marker* is inserted before the loop, and a *test* is called as the first job inside the loop. The first time the test is called, it records the time, and if the loop has taken over 100ms then the loop will `break` out and the remaining JavaScript is executed.

### Why not use an AST?

The parsing would be 100% robust if we did use an AST, but the overhead would be at the cost of around 200-300K for the parser.

For it's purpose, this manual loop protection works pretty well. Most people spot their infinite loops whilst they're typing and will fix the code, but if like [JS Bin](http://jsbin.com) you're rendering the output and JavaScript in real-time, you'll need to prevent the browser from hanging. This simple loop protection is one defence against loops.


## TODO / ideas

- If the time between tests is 100ms or more, it's likely we're looking at a loop with an `alert` (or type of blocking call), so perhaps the loop protection can back off?

## License

http://jsbin.mit-license.org
