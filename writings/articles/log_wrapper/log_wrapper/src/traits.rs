
use log::{trace, info};
use crate::logging::Logging;


pub trait F {
    fn f(&self) -> i32;
}


impl<T: F> F for Logging<T> {
    fn f(&self) -> i32 {
        trace!("About to run F.f()");
        let result = self.inner().f();
        info!("Result of running F.f(): {}", result);
        result
    }
}