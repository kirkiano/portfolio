
use crate::traits::F;


pub struct C;


impl C {
    pub fn foo(&self) -> i32 {
        42
    }
}


impl F for C {
    fn f(&self) -> i32 {
        self.foo()
    }
}