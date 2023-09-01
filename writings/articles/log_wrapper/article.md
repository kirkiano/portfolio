# Log wrapper

You may have heard advice discouraging the inclusion of print statements in
functions that already do something else. It recalls the precept that pure code
should live apart from code that has side-effects; Haskell, for example,
enforces the segregation using its type system. Such rules are examples of the
more fundamental principle of [separation of
concerns](separation_of_concerns.md), and in this article we show, in Rust, how
it can ease the control of logging.

Suppose we have a class `C` of objects (*ie*, a `struct`) containing some
method `f`.  Client code might then look like this:
```rust
fn some_function(c: &C) {
    /* ... */
    let x = c.f();
    /* ... */
}

fn main() {
    /* ... initialize logger ... */
    let c = ...; // instantiate a C
    some_function(&c);
}
```
The next day we decide that we need to observe `f`'s execution. So we add a log
statement at the beginning of `f`, to trace the moment of invocation, and we
add another at the end of `f`, to observe the result:
```rust
impl C {
    fn f(&self) -> i32 {
        trace!("About to run C.f()");
        /*
           ...
           f's original code
           ...
        */
        let result = ...;
        info!("Result of running C.f(): {}", result);
        result
    }

    /*
    ... other methods
    */
}
```

The day after, however, we decide that we no longer need the log statements and
wish to go back to the original version of `f`. This of course means modifying
`f` again, and you now see the problem: it is quite possible that we will need
the log statements again...and then not...and then back again...and so on, so
that each change would mean re-writing or re-deleting.

Not a productive use of our time.

(Popular logging libraries for Rust can restrict log statements by *target*,
allowing us to turn some of them on or off at run time, *eg*, by environment
variables. But this solution keeps the log statements in the compiled code, and
that might not be acceptable if there are limits on the executable's size.)

Enter separation of concerns. As typically happens, it can be achieved here by
introducing some abstractions, as follows. Indeed the need for more abstraction
might have already occurred to you on seeing that the signature of
`some_function` grants it access to all of `C`'s methods, even though only `f`
is used.

The first stage of refactoring, then, is to make `f` the lone method of a new
trait `F` (*traits* are Rust's way of ad hoc polymorphism; they correspond to
type classes in Haskell and, more or less, interfaces in Java):
```rust
trait F {
    fn f(&self) -> i32;
}
```
This allows us wisely to genericize `some_function`:
```rust
fn some_function<T: F>(t: &T) {
    /* ... */
    let x = t.f();
    /* ... */
}
```
Meanwhile `main` needs no change, and by passing a `C` as the `F` that
`some_function` expects, it performs a kind of *dependency injection*---another
kind of separation of concerns, one of whose benefits is touched on below.

The second stage of refactoring is of course to get `C` to implement `F`:
```rust
impl F for C {
    fn f(&self) -> i32 {
        // No log statements in this method!
        /*
           ...
           f's original code
           ...
        */
    }
}

impl C {
    /*
    ... other methods, as before
    */
}
```
And the third stage is to introduce a generic wrapper type:
```rust
struct Logging<T>(T);
```
It is where we move the log statements to:
```rust
impl<T: F> F for Logging<T> {
    fn f(&self) -> i32 {
        trace!("About to run F.f()"); // "C.f()" is now "F.f()"
        let result = self.0.f();
        info!("Result of running F.f(): {}", result); // ditto
        result
    }
}
```
Now at last we are able to turn logging on or off, by adding or subtracting one
little line in `main`:
```rust
fn main() {
    /* ... initialize logger ... */
    let c = ...; // instantiate a C
    let c = Logging(c); // one new line (c shadowed only for convenience)
    some_function(&c);
}
```
This is trivial next to the chore we faced at the outset, of re-adding and
re-deleting log statements.

Mission accomplished.

Moreover when we need to change `f`'s implementation details, we do so in the
`impl F for C`, whereas when we need to change the log statements, we do so in
the `impl<T: F> F for Logging<T>`. Modifying the one `impl` spares us the
distraction of, and the risk of accidentally breaking, the other. And because
dependency injection has now made `some_function` indifferent to such changes,
they force no recompilation of it (though in Rust that might really mean *less*
recompilation; see [here](https://stackoverflow.com/a/44349724) for example).

The code has thus become not only easier with respect to logging, but also
easier to reason about, safer to modify, and so more likely to run right. The
benefits may seem modest here, but in more intricate scenarios, or when
reapplied across a large codebase, the technique can spell salvation.

Bear in mind however that every rule has its exceptions. "Log-wrapping" is not
always suitable, and separating concerns is not always advisable. Decide each
case by good common sense.

I hope this helps...and happy coding!
