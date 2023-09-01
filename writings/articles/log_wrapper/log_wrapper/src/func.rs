
use crate::traits::F;


pub fn some_function<T: F>(t: &T) {
    /* ... */
    let _x = t.f();
    /* ... */
}