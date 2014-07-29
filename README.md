# loop-protect

JS Bin's loop protection implementation.

Note that this does *not* solve the [halting problem](http://en.wikipedia.org/wiki/Halting_problem) but simply rewrites JavaScript (without an AST) wrapping loops with a conditional break.

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

### Methods

- loopProtect.method (string)
- loopProtect.hit (callback)
- loopProtect.debug (method)
- loopProtect.protect (callback)

## License

http://jsbin.mit-license.org

## Contributors

- [Remy Sharp](https://github.com/remy)
- [Tom Ashworth](https://github.com/phuu)
- [Nathan Hammond](https://github.com/nathanhammond)