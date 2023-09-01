
mod traits;
mod struc;
mod logging;
mod func;

use crate::{struc::C,
            logging::Logging,
            func::some_function};


fn main() {
    env_logger::init();
    let c = C;
    let c = Logging::new(c);
    some_function(&c);
}